package migrations

import "github.com/AlexGalhardo/vukem/schema"

func createLearners() schema.Migration {
	return schema.Migration{ID: "20261105010000_create_learners", Up: func(s *schema.Schema) error {
		return s.Raw(`CREATE TABLE learners (id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, progress TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0)`)
	}, Down: func(s *schema.Schema) error { return s.DropIfExists("learners") }}
}
