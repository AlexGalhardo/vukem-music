# Verification evidence

Date: 2026-11-05. Toolchain: Go 1.27.3, Bun 1.4.4, Chromium through Playwright 1.64.1.

## Initial foundation

- Official Vukem CLI generated React/Inertia + SQLite starter. Framework is pinned
  in `go.mod`; Bun dependencies have a committed lockfile.
- Initial frontend type check/build, Go tests, Biome and Markdown lint passed.
- Initial commit: `1589912177179630fd2f0b2848729b4d2d053e2b`; pushed to origin/main.
- Original study references cover chapters 1–58 and final sections, without book/OCR assets.

## MVP checks completed locally

- `bun check`: TypeScript checks frontend, sample tooling, unit tests and Railway IaC.
- `bun lint`: Biome v2 checks code and formatting; narrow SVG/scroll accessibility
  exceptions are documented next to the relevant attributes.
- `bun lint:md`: 75 Markdown files, no findings at the last check.
- `bun run test`: 10 unit tests, 137 assertions passed. Covers pitch/enharmonic
  spelling, rational/dotted values, all lesson measure lengths, rests, timing,
  resume segments, corrupt progress, sample pitch audit, manifest validation and
  mocked ElevenLabs success/error requests and safe environment setup.
- `bun run build`: production assets built successfully.
- `go test ./...`: passed with curriculum routes/data/locale checks, missing-lesson
  handling, healthcheck, backup/restore integrity and overwrite refusal.
- `go test -race -count=1 ./...` and `go vet ./...`: passed with the backup command included.
- `go tool govulncheck ./...`: zero reachable vulnerabilities reported; one finding
  exists in required modules but is not reached by application code.
- `bun audio:generate --from 60 --to 60`: dry run passed with one planned request;
  no external audio generation or billing was performed.
- `bun run test:e2e`: 4 browser journeys passed, including EN/PT navigation,
  completion/reload, correct and incorrect exercise answers, piano answers, audio
  transport/highlights/rests, mobile navigation/theme/keyboard, and corrupt storage.
- Desktop and mobile screenshots were visually inspected. The player marks its
  synthesized preview; note and piano highlights share the same musical events.

## Production verification

- Multi-stage Docker build passed locally after reducing intermediate-layer duplication.
- Container started as the image's non-root user with a fresh named SQLite volume.
- `/up?checks=1` returned 200; production served embedded EN/PT curriculum.
- Startup migration installed eight lessons; a container restart preserved those
  records and did not duplicate them.
- `db:backup` produced consistent snapshots before/after restart; restored copies
  each passed `PRAGMA integrity_check` with eight lesson records.
- The local-image test covered production packaging, migration, persistence and
  backup. The final source is also built by remote CI; live Railway remains untested.

## Publication

Initial main-branch CI passed:
[foundation run](https://github.com/AlexGalhardo/vukem-music/actions/runs/42022108308).
The studio implementation was pushed as `bcfb6b53965fd3bb71349b4ca482770117b1681b`.
Its first CI run passed image/Go/security/vulnerability/Markdown jobs, but exposed a
cold-start test setup issue: the app binary’s `key:generate` prints a key instead
of writing `.env`. The follow-up fix adds private, idempotent `bun run setup` and
an ephemeral Playwright-server key. A fresh server on an isolated port with an
empty inherited APP_KEY passed all four browser journeys. The fixed revision `7937a2da5f9c1c0b8f0fdbe2105e7f0aa3e6791b` passed all six jobs:
[verified implementation CI](https://github.com/AlexGalhardo/vukem-music/actions/runs/42027916487).
This includes the frontend/type/lint/unit/browser job, race-enabled Go checks,
production image, Markdown, reachable-vulnerability checks and secret scanning.
Remote main matched local HEAD at verification; subsequent changes document the
handoff and preserve third-party attribution.

## External checks not performed

- ElevenLabs recording generation, timbre listening review and approved sample-bank distribution.
- Railway project application, DNS changes, public HTTPS and persistence across a live deploy.

These require the maintainer's service access. Local code/configuration and mocked
API tests do not establish that the external operations were completed.

## Round-2 approval update

The maintainer explicitly approved Q4–Q6. Updated `docs/brainstorming.md`,
`docs/project-decisions.md` and `ROADMAP.md` to distinguish the earlier assumptions
from the current approved decisions. This is a documentation-only change;
Markdown lint and whitespace checks validate it. Existing runtime behavior and
external-operation completion statuses are unchanged.

## Repertoire and harmony delivery — 2026-11-05

The maintainer explicitly reprioritized these features while service credentials
remain unavailable. Research is documented in `docs/repertoire-50.md`.

- Acquired 22 source PDFs and prepared a local bundle for 50 distinct works:
  30 historical page excerpts and 20 individual Mutopia editions. All 50 files
  open in PyMuPDF and match their recorded SHA-256. Source pages identify the
  intended work; excerpts may contain neighboring pieces or teacher parts.
- Checked edition-specific Mutopia footer credits/licenses against the source
  metadata. No PDFs, book scans or generated excerpt bundles are tracked in Git.
- `bun scores:fetch` reports 50 works / 22 editions without network access.
  `bun scores:fetch --download` passed with 21 verified cached editions and one
  real source download matching the pinned hash.
- `bun check`, `bun lint`, `bun lint:md` and `git diff --check`: passed.
- `bun run test`: 13 tests passed, 688 assertions, including root vs inversion,
  written diminished sevenths with double flats and the 50-work provenance catalog.
- `bun run build`: passed. `go test -race -count=1 ./...` and `go vet ./...`: passed,
  including direct Vukem routes for `/library` and `/harmony`.
- Final `bun run test:e2e`: all five journeys passed on isolated port 3101 in
  18.4 seconds, with a fresh server. New coverage includes 50 works, composer and
  level filtering, second-inversion C major sounding/highlighting three keys,
  Stop cleanup, diminished-seventh spelling, preserved selection across EN/PT,
  and the harmony layout at 390px without page-wide horizontal overflow.
- A focused follow-up browser run passed after extending the SVG viewBox for
  high inversions. It verifies B7 in third inversion (A5–B5–D♯6–F♯6); ledger
  lines and stem remain inside the staff view.
- Inspected desktop library/harmony screenshots and the Portuguese mobile view.
  A first browser run identified an overly exact label query in the new test;
  using the combobox's accessible name corrected it. Another run exposed that
  the full language reload reset chord selection; Inertia state-preserving locale
  navigation corrected the behavior before the final five-journey run.

The fifty PDFs are available for reading, not yet converted for synchronized
playback. Harmony tasks are original open questions, not graded mastery tests.
External expert review, full-repertoire transcription, real ElevenLabs generation
and Railway/DNS deployment remain unchecked. A presence-only key check reported
`ELEVENLABS_API_KEY` missing; no secret value was printed or API charge incurred.

The implementation was pushed as `69c837f81443defa6925157379dbbb8cfa3b6d6a`.
All six remote CI jobs passed:
[repertoire/harmony CI run](https://github.com/AlexGalhardo/vukem-music/actions/runs/42084474571).
This includes the production image, race-enabled Go checks, vulnerability checks,
secret scanning, Markdown and frontend/browser checks. The remote browser run
passed all five journeys in 7.0 seconds. Remote `main` matched the implementation
SHA when checked. A documentation-only commit records this observed result.

## Full-roadmap implementation extension — 2026-11-05

The full-roadmap request authorized the previously future software phases.
Implemented: 58 original bilingual topic/review entries, semantic interval/scales
and extended chord construction, MusicXML validation/OSMD engraving, rational
polyphony/ties/repeats, audio-only transposition and fixed-C tuning comparisons,
optional SQLite accounts with ownership/CSRF/revision checks, JSON progress
portability, MIDI velocity/sustain cleanup and opt-in local microphone estimates.

Validation of this extension:

- `bun check` and Biome passed; markdownlint0.24.0 passed all 80 Markdown files.
- 24 unit tests, 1,408 assertions passed. Fixtures include unsafe XML, rational
  tuplets, ties, repeat endings, explicit nested-repeat rejection, interval quality,
  scale spelling, alternate answers, ninth inversions, MIDI parsing, noise and
  harmonic pitch estimates, validated backup and all fifty source input hashes.
- Eleven Playwright journeys passed together after the production source-review
  gate was added (4.2 minutes under concurrent compilation). They cover the original
  product, 58-topic rounds, account save/restore/deletion, MusicXML SVG/polyphony,
  MIDI sustain/repeated notes/blur/disconnect, microphone opt-in/local440Hz/track
  release, and the licensed Mozart edition's SVG/piano transport in EN/PT.
- The browser also verifies that the unresolved Reinagle edition's route and
  generated JSON both return404. The native Mozart page screenshot was visually
  inspected for score/control/piano layout; this is not a fifty-score PDF review.
- `go test -race -count=1 ./...` passed, including account isolation/conflict/CSRF
  tests and the production catalog gate. Go vet passed before the catalog gate;
  a final vet check and the commit hook also cover the final Go changes.
- Frontend production build passed. OpenSheetMusicDisplay is a separate lazy
  chunk (approximately1.4MB before gzip); the bundler's large-chunk notice is
  expected. XML is passed as a Document so short XML is never interpreted as a URL.
- All fifty notation sources compiled through the separate editorial-review
  command, with MIDI/engraved-attack consistency checks. Production publishes
  only twenty licensed source editions. Thirty hand transcriptions remain drafts;
  Reinagle No.5 bar12 has an unresolved bass reading. No automated check is claimed
  as independent source comparison or specialist content review.
- `bun audit` found no vulnerabilities across362 packages after updating Markdown
  tooling and pinning documented security overrides for KaTeX and re2js.

Local Docker validation hit the managed environment's small filesystem twice.
Unused build cache was pruned, and the asset stage switched to Debian Bun slim
for glibc-compatible LilyPond with less image storage. A subsequent older-dependency
build was cancelled after package security updates superseded its context; it had
installed dependencies and compiled initial source editions. Do not report this as
an entirely verified final image. The new remote image job must validate the final
Dockerfile and lockfile; record its actual result after publication.

No real ElevenLabs generation, listening approval, Railway deployment, DNS update
or independent musical specialist review occurred in these checks. See the
remaining quality gates and exact supported-feature contracts in `ROADMAP.md`,
[extended learning](extended-learning.md), [score build](score-build.md) and
[accounts](accounts.md).
