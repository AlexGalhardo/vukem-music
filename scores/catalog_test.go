package scores

import "testing"

func TestProductionCatalogExcludesUnreviewedTranscriptions(t *testing.T) {
	if !Has("mozart-k2") {
		t.Fatal("licensed source edition must be available")
	}
	for _, id := range []string{"beyer-op101-03", "reinagle-op1-05", "unknown"} {
		if Has(id) {
			t.Fatalf("unreviewed/unknown score %q must not be published", id)
		}
	}
}
