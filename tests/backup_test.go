package tests

import (
	"database/sql"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/AlexGalhardo/vukem-music/app/commands"
	"github.com/AlexGalhardo/vukem-music/bootstrap"
	"github.com/AlexGalhardo/vukem/vukemtest"
)

func TestConsistentBackupAndRestore(t *testing.T) {
	t.Parallel()
	app := vukemtest.New(t, bootstrap.New)
	db, err := app.DB()
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "snapshot.sqlite")
	if err := commands.Backup(t.Context(), db, path); err != nil {
		t.Fatal(err)
	}
	if err := commands.Backup(t.Context(), db, path); err == nil {
		t.Fatal("existing backup was overwritten")
	}
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	// Windows has no POSIX permission bits: Go reports 0666 for any writable file.
	if runtime.GOOS != "windows" && info.Mode().Perm() != 0o600 {
		t.Fatalf("backup permissions=%o", info.Mode().Perm())
	}
	restored, err := sql.Open("sqlite", path)
	if err != nil {
		t.Fatal(err)
	}
	defer restored.Close()
	var count int
	if err := restored.QueryRowContext(t.Context(), "SELECT COUNT(*) FROM lessons").Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 8 {
		t.Fatalf("restored lessons=%d", count)
	}
	var check string
	if err := restored.QueryRowContext(t.Context(), "PRAGMA integrity_check").Scan(&check); err != nil {
		t.Fatal(err)
	}
	if check != "ok" {
		t.Fatalf("restored integrity=%s", check)
	}
}
