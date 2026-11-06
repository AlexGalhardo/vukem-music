// Package accounts provides optional handle-based accounts and versioned progress snapshots.
package accounts

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/AlexGalhardo/vukem/auth"
	"github.com/AlexGalhardo/vukem/auth/hash"
	"github.com/AlexGalhardo/vukem/database"
	"github.com/AlexGalhardo/vukem/ratelimit"
	"github.com/AlexGalhardo/vukem/router"
	"github.com/AlexGalhardo/vukem/web"
)

type User struct {
	ID       string `json:"id"`
	Handle   string `json:"handle"`
	Password string `json:"-"`
}

func (u User) AuthID() string       { return u.ID }
func (u User) AuthPassword() string { return u.Password }

type provider struct{ db *database.DB }

func (p provider) ByID(ctx context.Context, id string) (User, error) {
	var u User
	err := p.db.QueryRowContext(ctx, "SELECT id, handle, password_hash FROM learners WHERE id=?", id).Scan(&u.ID, &u.Handle, &u.Password)
	if errors.Is(err, sql.ErrNoRows) {
		err = auth.ErrUserNotFound
	}
	return u, err
}
func (p provider) ByCredentials(ctx context.Context, c map[string]string) (User, error) {
	var u User
	err := p.db.QueryRowContext(ctx, "SELECT id, handle, password_hash FROM learners WHERE handle=?", c["handle"]).Scan(&u.ID, &u.Handle, &u.Password)
	if errors.Is(err, sql.ErrNoRows) {
		err = auth.ErrUserNotFound
	}
	return u, err
}

type Foundation struct {
	Version   int      `json:"version"`
	Completed []string `json:"completed"`
	Attempts  int64    `json:"attempts"`
	Correct   int64    `json:"correct"`
}
type Course struct {
	Version  int      `json:"version"`
	Read     []string `json:"read"`
	Attempts int64    `json:"attempts"`
	Correct  int64    `json:"correct"`
	Rounds   int64    `json:"rounds"`
	Best     int      `json:"best"`
}
type Snapshot struct {
	Version    int        `json:"version"`
	Foundation Foundation `json:"foundation"`
	Course     Course     `json:"course"`
}

var slug = regexp.MustCompile(`^[a-z][a-z0-9-]{0,79}$`)
var chapter = regexp.MustCompile(`^chapter-(0[1-9]|[1-4][0-9]|5[0-8])$`)
var handlePattern = regexp.MustCompile(`^[a-z0-9_]{3,32}$`)

func ValidSnapshot(v Snapshot) bool {
	if v.Version != 1 || v.Foundation.Version != 1 || v.Course.Version != 1 || v.Foundation.Completed == nil || v.Course.Read == nil || len(v.Foundation.Completed) > 500 || len(v.Course.Read) > 58 {
		return false
	}
	seen := map[string]bool{}
	for _, id := range v.Foundation.Completed {
		if !slug.MatchString(id) || seen[id] {
			return false
		}
		seen[id] = true
	}
	for _, id := range v.Course.Read {
		if !chapter.MatchString(id) || seen[id] {
			return false
		}
		seen[id] = true
	}
	for _, n := range []int64{v.Foundation.Attempts, v.Foundation.Correct, v.Course.Attempts, v.Course.Correct, v.Course.Rounds} {
		if n < 0 || n > 1000000000 {
			return false
		}
	}
	return v.Foundation.Correct <= v.Foundation.Attempts && v.Course.Correct <= v.Course.Attempts && v.Course.Best >= 0 && v.Course.Best <= 10 && int64(v.Course.Best) <= v.Course.Correct && (v.Course.Rounds > 0 || v.Course.Best == 0) && v.Course.Rounds <= v.Course.Attempts/10
}
func EmptySnapshot() Snapshot {
	return Snapshot{Version: 1, Foundation: Foundation{Version: 1, Completed: []string{}}, Course: Course{Version: 1, Read: []string{}}}
}
func decode(c *web.Ctx, dst any) error {
	data, err := io.ReadAll(io.LimitReader(c.Request().Body, 65537))
	if err != nil {
		return err
	}
	if len(data) > 65536 {
		return errors.New("request-size")
	}
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.DisallowUnknownFields()
	if err = decoder.Decode(dst); err != nil {
		return err
	}
	if err = decoder.Decode(new(any)); !errors.Is(err, io.EOF) {
		return errors.New("trailing-data")
	}
	return nil
}

type Service struct {
	db     *database.DB
	guard  *auth.SessionGuard[User]
	hasher hash.Hasher
	logins *ratelimit.Memory
}

func New(db *database.DB, hasher hash.Hasher) *Service {
	guard := auth.NewSessionGuard("music", provider{db}, hasher, nil)
	guard.IdentifierField = "handle"
	return &Service{db: db, guard: guard, hasher: hasher, logins: ratelimit.NewMemory(10, 10*time.Minute)}
}
func (s *Service) Routes(r *router.Router) {
	ip := ratelimit.Middleware(ratelimit.NewMemory(10, time.Minute), ratelimit.ByIP)
	r.Post("/api/account/register", s.Register).Use(ip)
	r.Post("/api/account/login", s.Login).Use(ip)
	r.Get("/api/account", s.Current)
	r.Post("/api/account/logout", s.Logout)
	r.Put("/api/account/progress", s.Save)
	r.Delete("/api/account", s.Delete).Use(ip)
}
func (s *Service) Register(c *web.Ctx) error {
	var in struct {
		Handle   string `json:"handle"`
		Password string `json:"password"`
	}
	if decode(c, &in) != nil {
		return c.JSON(422, web.Map{"error": "invalid-account"})
	}
	in.Handle = strings.ToLower(strings.TrimSpace(in.Handle))
	if !handlePattern.MatchString(in.Handle) || utf8.RuneCountInString(in.Password) < 12 || utf8.RuneCountInString(in.Password) > 256 || len(in.Password) > 1024 {
		return c.JSON(422, web.Map{"error": "invalid-account"})
	}
	password, err := s.hasher.Make(in.Password)
	if err != nil {
		return err
	}
	snapshot, _ := json.Marshal(EmptySnapshot())
	u := User{ID: rand.Text(), Handle: in.Handle, Password: password}
	_, err = s.db.ExecContext(c.Context(), "INSERT INTO learners(id,handle,password_hash,progress) VALUES(?,?,?,?)", u.ID, u.Handle, password, string(snapshot))
	if err != nil {
		var found string
		if lookup := s.db.QueryRowContext(c.Context(), "SELECT id FROM learners WHERE handle=?", in.Handle).Scan(&found); lookup == nil {
			return c.JSON(409, web.Map{"error": "handle-unavailable"})
		}
		return err
	}
	if err = s.guard.Login(c, u); err != nil {
		return err
	}
	return s.Current(c)
}
func (s *Service) Login(c *web.Ctx) error {
	var in struct {
		Handle   string `json:"handle"`
		Password string `json:"password"`
	}
	if decode(c, &in) != nil || len(in.Password) > 1024 {
		return c.JSON(422, web.Map{"error": "invalid-account"})
	}
	in.Handle = strings.ToLower(strings.TrimSpace(in.Handle))
	if !handlePattern.MatchString(in.Handle) {
		return c.JSON(422, web.Map{"error": "invalid-account"})
	}
	digest := sha256.Sum256([]byte(in.Handle))
	allowed, err := s.logins.Allow(c.Context(), hex.EncodeToString(digest[:]))
	if err != nil {
		return err
	}
	if !allowed.Allowed {
		return c.JSON(http.StatusTooManyRequests, web.Map{"error": "account-rate"})
	}
	if _, err = s.guard.Attempt(c, map[string]string{"handle": in.Handle, "password": in.Password}); err != nil {
		return c.JSON(422, web.Map{"error": "invalid-credentials"})
	}
	return s.Current(c)
}
func (s *Service) Current(c *web.Ctx) error {
	c.Writer().Header().Set("Cache-Control", "no-store")
	u, err := s.guard.User(c)
	if err != nil {
		return c.JSON(401, web.Map{"error": "signed-out"})
	}
	var raw string
	var revision int64
	if err = s.db.QueryRowContext(c.Context(), "SELECT progress,revision FROM learners WHERE id=?", u.ID).Scan(&raw, &revision); err != nil {
		return err
	}
	c.Writer().Header().Set("Cache-Control", "no-store")
	return c.JSON(200, web.Map{"user": u, "revision": revision, "snapshot": json.RawMessage(raw)})
}
func (s *Service) Logout(c *web.Ctx) error {
	if err := s.guard.Logout(c); err != nil {
		return err
	}
	return c.JSON(200, web.Map{"ok": true})
}
func (s *Service) Save(c *web.Ctx) error {
	u, err := s.guard.User(c)
	if err != nil {
		return c.JSON(401, web.Map{"error": "signed-out"})
	}
	var in struct {
		Revision int64    `json:"revision"`
		Snapshot Snapshot `json:"snapshot"`
	}
	if decode(c, &in) != nil || in.Revision < 0 || !ValidSnapshot(in.Snapshot) {
		return c.JSON(422, web.Map{"error": "invalid-progress"})
	}
	raw, err := json.Marshal(in.Snapshot)
	if err != nil {
		return err
	}
	result, err := s.db.ExecContext(c.Context(), "UPDATE learners SET progress=?,revision=revision+1 WHERE id=? AND revision=?", string(raw), u.ID, in.Revision)
	if err != nil {
		return err
	}
	n, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return c.JSON(409, web.Map{"error": "progress-conflict"})
	}
	return s.Current(c)
}
func (s *Service) Delete(c *web.Ctx) error {
	u, err := s.guard.User(c)
	if err != nil {
		return c.JSON(401, web.Map{"error": "signed-out"})
	}
	var in struct {
		Password string `json:"password"`
	}
	if decode(c, &in) != nil || len(in.Password) > 1024 {
		return c.JSON(422, web.Map{"error": "invalid-account"})
	}
	ok, err := s.hasher.Verify(u.Password, in.Password)
	if err != nil || !ok {
		return c.JSON(422, web.Map{"error": "invalid-credentials"})
	}
	if _, err = s.db.ExecContext(c.Context(), "DELETE FROM learners WHERE id=?", u.ID); err != nil {
		return err
	}
	return s.Logout(c)
}
