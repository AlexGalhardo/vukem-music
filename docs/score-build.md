# Reproducible repertoire engraving

The research library has 50 works and fifty source entries. Production publishes
**20 study editions** derived from licensed Mutopia notation. Thirty new handwritten
Beyer/Reinagle transcriptions are review drafts, excluded from production routes
and assets until their pitches/rhythm are checked independently against the PDFs.
The full fifty-work source-verification assertion remains pending.

`bun scripts/build-scores.ts --include-drafts` compiles all sources into ignored
`storage/review-scores` for editorial comparison. This command does not publish
them. Normal `bun run build` validates input hashes but omits pending drafts.
Reinagle No.5 bar12 includes an explicitly unresolved/editorial bass rest: resolve
that scan reading before considering publication. Do not remove the review gate
merely because LilyPond accepts a transcription.

## Inputs and licenses

`scores/manifest.json` records source URL, normalized source hash, original source
hash, PDF hash, license and contributor per work. The Mutopia revision is pinned
in immutable raw source URLs. `scores/sources/*.ly` retain original notices.
Diabelli and Schumann adaptations retain their respective CC BY-SA terms; the
project's MIT license does not replace them. See [third-party notices](../THIRD_PARTY_NOTICES.md).
New Beyer/Reinagle study engravings are MIT; the historical compositions are public domain.
Nos.3–11 contain only the two-handed student primo, without teacher secondo.
Nos.12–20 are piano-solo studies. Historical fingerings and phrase slurs are
omitted. All thirty new transcriptions remain unpublished review drafts. Compare them
with the linked PDFs; do not call them critically verified editions.

The Beyer No.7 source reference was corrected from PDF21 to PDF18–19 (student
part on PDF19). Research metadata, excerpt hash and the local study ZIP were
updated together. This correction is evidence that source acquisition alone is
not exhaustive notation review.

## Build

`bun run build` runs `bun run scores:build` before Vite. On Linux x86-64 it downloads
LilyPond2.26.0 from its official release and checks the pinned archive SHA-256.
Other platforms should provide `LILYPOND_BIN` pointing to that version or use the
Docker build. The Debian Bun asset stage supplies glibc; the final app image does
not run LilyPond. The compiler is GPL software used as a build tool; generated
score output retains each edition's terms.

Original sources were normalized with the official `convert-ly`, while preserving
musical content. Legacy repeat/crescendo commands were updated, Burgmüller's old
`f8'` syntax became `f'8`, and Petzold attribution replaces legacy Bach attribution.
Study engravings unfold repetitions so visible notes and performed traversal have
one explicit timeline. Practice playback uses a selected fixed quarter-note BPM;
source tempo changes and full expressive interpretation are not reproduced.

Our own Scheme engraver records note spelling, rational onset/duration and a
source ID on each SVG note head. The MIDI reader retains performed gates and
velocity. Every MIDI attack must match an engraved pitch/onset (one MIDI-tick
tolerance); grace realization has an explicit bounded match. Every engraved note
must have a sounding MIDI voice at its onset, including ties. Compiler bar-check
and programming errors fail the build. These consistency checks detect conversion
errors, but cannot prove a new transcription matches the printed PDF.

SVG is parsed through an element/attribute allowlist, external links are removed,
and scripts/external references are rejected. Build output includes per-file
SHA-256 hashes. The browser verifies document/page hashes before displaying the
curated SVG. Imported user files never enter this LilyPond pipeline.

Compiler archives/cache live under ignored `storage/`; generated pages, MIDI and
JSON assets are build output under ignored `resources/public/generated-scores`.
Do not commit them. Production embeds the generated public assets. Record visual
comparison, browser synchronization and any editorial omissions before marking
each roadmap quality assertion complete.
