// Package curriculum owns the original bilingual course and its SQLite repository.
package curriculum

import (
	"context"
	_ "embed"
	"encoding/json"

	"github.com/AlexGalhardo/vukem/database"
)

//go:embed lessons.json
var catalog []byte

// Record stores one versioned lesson document, including both translations.
type Record struct {
	ID    string `json:"id"`
	Order int    `json:"order"`
}

// Documents returns the embedded, original curriculum as independent JSON records.
func Documents() ([]json.RawMessage, error) {
	var docs []json.RawMessage
	err := json.Unmarshal(catalog, &docs)
	return docs, err
}

// All loads persisted lessons in pedagogical order. A migration populates them.
func All(ctx context.Context, db *database.DB) ([]json.RawMessage, error) {
	rows, err := db.QueryContext(ctx, "SELECT document FROM lessons ORDER BY position")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	lessons := make([]json.RawMessage, 0)
	for rows.Next() {
		var document string
		if err := rows.Scan(&document); err != nil {
			return nil, err
		}
		lessons = append(lessons, json.RawMessage(document))
	}
	return lessons, rows.Err()
}
