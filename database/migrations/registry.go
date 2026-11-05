// Package migrations holds schema and curriculum migrations.
package migrations

import "github.com/AlexGalhardo/vukem/schema"

func All() []schema.Migration { return []schema.Migration{createLessons()} }
