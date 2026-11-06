package tests

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/AlexGalhardo/vukem-music/app/accounts"
	"github.com/AlexGalhardo/vukem-music/bootstrap"
	"github.com/AlexGalhardo/vukem/vukemtest"
)

func TestOptionalAccountIsolationVersioningAndDeletion(t *testing.T) {
	app := vukemtest.New(t, bootstrap.New)
	alice := app.Client(t).AcceptJSON()
	bob := app.Client(t).AcceptJSON()
	guest := app.Client(t).AcceptJSON()
	guest.Get("/api/account").AssertStatus(401)
	credentials := map[string]string{"handle": "alice_study", "password": "example-study-test-passphrase"}
	alice.PostJSON("/api/account/register", credentials).AssertOK().AssertJSONPath("user.handle", "alice_study").AssertDontSee("password_hash").AssertDontSee("argon2")
	bob.PostJSON("/api/account/register", map[string]string{"handle": "bob_study", "password": "another-example-study-passphrase"}).AssertOK()
	snapshot := accounts.EmptySnapshot()
	snapshot.Foundation.Completed = []string{"treble-clef"}
	snapshot.Foundation.Attempts = 2
	snapshot.Foundation.Correct = 1
	snapshot.Course.Read = []string{"chapter-40"}
	body := map[string]any{"revision": 0, "snapshot": snapshot}
	alice.PutJSON("/api/account/progress", body).AssertOK().AssertJSONPath("revision", float64(1))
	alice.PutJSON("/api/account/progress", body).AssertStatus(409)
	bob.Get("/api/account").AssertOK().AssertJSONPath("revision", float64(0)).AssertJSONCount("snapshot.foundation.completed", 0)
	guest.PutJSON("/api/account/progress", body).AssertStatus(401)
	snapshot.Foundation.Correct = 3
	alice.PutJSON("/api/account/progress", map[string]any{"revision": 1, "snapshot": snapshot}).AssertStatus(422)
	alice.WithHeader("Sec-Fetch-Site", "cross-site").PutJSON("/api/account/progress", body).AssertStatus(403)
	alice.WithHeader("Sec-Fetch-Site", "same-origin").Get("/api/account").AssertOK().AssertJSONPath("revision", float64(1))
	alice.PostJSON("/api/account/logout", map[string]any{}).AssertOK()
	alice.Get("/api/account").AssertStatus(401)
	alice.PostJSON("/api/account/login", credentials).AssertOK().AssertJSONPath("snapshot.foundation.correct", float64(1))
	wrong, _ := json.Marshal(map[string]string{"password": "wrong-example-password"})
	alice.Do("DELETE", "/api/account", bytes.NewReader(wrong), "application/json").AssertStatus(422)
	deletion, _ := json.Marshal(map[string]string{"password": credentials["password"]})
	alice.Do("DELETE", "/api/account", bytes.NewReader(deletion), "application/json").AssertOK()
	alice.Get("/api/account").AssertStatus(401)
	bob.Get("/api/account").AssertOK()
}

func TestProgressSchemaRejectsInvalidSnapshots(t *testing.T) {
	v := accounts.EmptySnapshot()
	if !accounts.ValidSnapshot(v) {
		t.Fatal("empty snapshot invalid")
	}
	v.Course.Best = 11
	if accounts.ValidSnapshot(v) {
		t.Fatal("accepted impossible score")
	}
	v = accounts.EmptySnapshot()
	v.Course.Read = []string{"chapter-99"}
	if accounts.ValidSnapshot(v) {
		t.Fatal("accepted unknown chapter")
	}
}
