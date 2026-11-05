package migrations

import (
	"encoding/json"

	"github.com/AlexGalhardo/vukem-music/app/curriculum"
	"github.com/AlexGalhardo/vukem/schema"
)

func createLessons() schema.Migration {
	return schema.Migration{
		ID: "20261105000000_create_lessons",
		Up: func(s *schema.Schema) error {
			if err := s.Create("lessons", func(t *schema.Table) {
				t.ID()
				t.String("slug").Unique()
				t.Integer("position")
				t.Text("document")
			}); err != nil {
				return err
			}
			docs, err := curriculum.Documents()
			if err != nil {
				return err
			}
			for _, doc := range docs {
				var record curriculum.Record
				if err := json.Unmarshal(doc, &record); err != nil {
					return err
				}
				if err := s.Raw("INSERT INTO lessons (slug, position, document) VALUES (?, ?, ?)", record.ID, record.Order, string(doc)); err != nil {
					return err
				}
			}
			return nil
		},
		Down: func(s *schema.Schema) error { return s.DropIfExists("lessons") },
	}
}
