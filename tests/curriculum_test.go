package tests

import (
	"encoding/json"
	"testing"

	"github.com/AlexGalhardo/vukem-music/app/curriculum"
	"github.com/AlexGalhardo/vukem-music/bootstrap"
	"github.com/AlexGalhardo/vukem/vukemtest"
)

func TestCurriculumRoutes(t *testing.T) {
	t.Parallel()
	app := vukemtest.New(t, bootstrap.New)
	client := app.Client(t).Inertia("")
	for _, path := range []string{"/", "/lessons", "/practice", "/progress", "/lessons/treble-clef"} {
		client.Get(path).AssertOK().AssertInertia("Study").HasProp("lessons", 8).
			PropEquals("lessons.0.id", "sound-and-pitch").PropEquals("locale", "en")
	}
	client.Get("/lessons/treble-clef?lang=pt-BR").AssertOK().AssertInertia("Study").
		PropEquals("locale", "pt-BR").PropEquals("lessons.0.title.pt-BR", "Conheça o som")
	client.Get("/lessons/not-a-lesson").AssertStatus(404)
	client.Get("/posts").AssertStatus(404)
	app.Client(t).Get("/audio/piano/manifest.json").AssertOK()
	vukemtest.AssertDatabaseHas(t, app, "lessons", map[string]any{"slug": "treble-clef", "position": 3})
}

func TestCurriculumDocuments(t *testing.T) {
	docs, err := curriculum.Documents()
	if err != nil {
		t.Fatal(err)
	}
	if len(docs) != 8 {
		t.Fatalf("lessons=%d", len(docs))
	}
	seen := make(map[string]bool)
	for _, document := range docs {
		var record curriculum.Record
		if err := json.Unmarshal(document, &record); err != nil {
			t.Fatal(err)
		}
		if record.ID == "" || seen[record.ID] {
			t.Fatalf("invalid/duplicate lesson ID %q", record.ID)
		}
		seen[record.ID] = true
	}
}
