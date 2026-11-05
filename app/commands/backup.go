// Package commands contains operational CLI commands, never public HTTP endpoints.
package commands

import (
	"context"
	"errors"
	"flag"
	"os"
	"path/filepath"

	vukem "github.com/AlexGalhardo/vukem"
	"github.com/AlexGalhardo/vukem/database"
)

// Backup writes a consistent snapshot including committed WAL content. It creates
// a private file and refuses existing destinations, including symlinks.
func Backup(ctx context.Context, db *database.DB, destination string) error {
	if destination == "" {
		return errors.New("provide --to with a new backup path")
	}
	if db.Dialect().Name() != "sqlite" {
		return errors.New("backup command requires SQLite")
	}
	path, err := filepath.Abs(destination)
	if err != nil {
		return err
	}
	file, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	if err := file.Close(); err != nil {
		_ = os.Remove(path)
		return err
	}
	if _, err := db.ExecContext(ctx, "VACUUM INTO ?", path); err != nil {
		_ = os.Remove(path)
		return err
	}
	return nil
}

func BackupCommand() vukem.Command {
	var destination string
	return vukem.CommandFunc{
		CommandName: "db:backup", Desc: "Write a consistent SQLite snapshot to a new private file",
		DefineFlags: func(fs *flag.FlagSet) { fs.StringVar(&destination, "to", "", "new snapshot file path") },
		Fn: func(ctx context.Context, app *vukem.App, _ []string) error {
			db, err := app.DB()
			if err != nil {
				return err
			}
			return Backup(ctx, db, destination)
		},
	}
}
