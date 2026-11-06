// Package scores identifies the curated, licensed playable study editions.
package scores

import (
	_ "embed"
	"encoding/json"
	"sync"
)

//go:embed manifest.json
var manifest []byte
var once sync.Once
var ids map[string]bool

func Has(id string) bool {
	once.Do(func() {
		var entries []struct {
			ID     string `json:"id"`
			Review string `json:"review"`
		}
		if err := json.Unmarshal(manifest, &entries); err != nil {
			panic(err)
		}
		ids = make(map[string]bool, len(entries))
		for _, entry := range entries {
			ids[entry.ID] = entry.Review != "pending"
		}
	})
	return ids[id]
}
