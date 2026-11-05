package controllers

import (
	"encoding/json"

	"github.com/AlexGalhardo/vukem-music/app/curriculum"
	"github.com/AlexGalhardo/vukem/database"
	"github.com/AlexGalhardo/vukem/errs"
	"github.com/AlexGalhardo/vukem/inertia"
	"github.com/AlexGalhardo/vukem/web"
)

// Study reads the persistent curriculum and renders the selected learning view.
func Study(db *database.DB, view string) web.HandlerFunc {
	return func(c *web.Ctx) error {
		lessons, err := curriculum.All(c.Context(), db)
		if err != nil {
			return err
		}
		selected := c.Param("lesson")
		if selected != "" {
			found := false
			for _, doc := range lessons {
				var record curriculum.Record
				if err := json.Unmarshal(doc, &record); err != nil {
					return err
				}
				if record.ID == selected {
					found = true
					break
				}
			}
			if !found {
				return errs.ErrNotFound
			}
		}
		return inertia.Render(c, "Study", inertia.Props{"lessons": lessons, "view": view, "selected": selected})
	}
}
