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
  backup. The final source was also built by remote CI; live Railway was untested
  at this stage.

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

## External checks pending at the initial handoff

- ElevenLabs recording generation, timbre listening review and approved sample-bank distribution.
- Railway project application, DNS changes, public HTTPS and persistence across a live deploy.

These were pending at the initial handoff. The Railway deployment and DNS checks
were completed later; see the live deployment evidence below.

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

At this stage, no real ElevenLabs generation, listening approval, Railway
deployment, DNS update or independent musical specialist review had occurred.
See the
remaining quality gates and exact supported-feature contracts in `ROADMAP.md`,
[extended learning](extended-learning.md), [score build](score-build.md) and
[accounts](accounts.md).

### Published extension and CI correction

Extension commit `0a1a06148d4f1337bf35510bab988b05f73506c1` was pushed to `main`.
[Its CI run](https://github.com/AlexGalhardo/vukem-music/actions/runs/42144683251)
passed the production image build, Go format/vet/race tests, vulnerability scan,
secret scanning and Markdown lint. Frontend type checking exposed an optional
research lookup in the new source-integrity test. The lookup now has an explicit
missing-entry guard before the hash assertion; the corrected local `bun check`
passes. A follow-up run must verify this correction before claiming all jobs green.

The maintainer subsequently supplied an ElevenLabs credential and explicitly
requested all application audio. It was configured only in the ignored private
`.env`, never committed. Two pilot requests returned HTTP200; the second raw
response was cached outside Git. The response was stereo-sized PCM, and its
channel fundamentals were around441Hz despite requesting MIDI60/C4. Neither
pilot was accepted as a tuned piano sample. The production manifest remains
unchanged; do not describe these responses as the finished 88-note bank. Format,
resampling and musical-quality handling need to be addressed before a large batch.

## Private ElevenLabs audio creation — 2026-11-06

The maintainer reiterated the request to create all application sounds with the
configured key. The observed account plan was Creator. Seventeen source anchors
were generated/cached; eleven passed source selection. The final private bank
contains 88 WAV PCM16 mono files at 44.1kHz, A0–C8/MIDI21–108. Each key derives from
an identified generated source using downmix, onset trim and libsoxr pitch
correction; no synthetic replacement was used. Subsequent processing reused all
cached responses with zero further billed generation requests.

`bun run audio:verify` re-read every final WAV, checked SHA-256 against provenance,
validated all 88 unique MIDI values and re-measured pitch/silence/clipping. Maximum
absolute measured deviation was 2.997680080749316 cents. WAV data totals28,202,880
bytes. Human listening review of timbre, noise and extreme-transposition artifacts
is still pending; these measurements are not a listening approval.

Outputs remain in ignored `storage/audio-bank/elevenlabs-piano`; raw sources are
in ignored `storage/audio-sources/elevenlabs-v3-wav`. The workspace artifact
`vukem-music-elevenlabs-piano-private.zip` includes the88 WAVs, original sources,
manifest, provenance, verification and a private-use README. No credential or
personal account identity is included.

The current [ElevenCreative terms, Exhibit 4 §2](https://elevenlabs.io/creative-terms)
explicitly restrict isolated audio/sample and sound-library distribution. The
bank is therefore private, outside Git and not MIT licensed. The public app's
empty manifest/synthesis preview remains unchanged. Do not interpret generation
as permission to publish a sample library; obtain the provider's written permission
or an appropriately licensed alternative before that public distribution.

The pipeline now decodes explicit WAV channel headers, preserves raw responses,
accepts offline reconstruction from cache and bounds generation to 17 anchors with
no automatic billed retries. The individual-note CLI also writes private output.
Tests cover stereo timing/downmix, malformed chunks, preserved-buffer isolation,
auth/rate errors and the existing pitch/manifest behavior. Source/private artifact
verification was performed on the actual generated files, not mocked API output.

Local checks:26 unit tests passed; type checking, Biome, Markdown lint, production
frontend/engraving build, Go tests and vet passed. Remote deployment changes up to
`c49abb8872131eb8b4fb7601624453f627b4f1de` were fast-forwarded without overwriting
those changes. The earlier extension CI run42145353944 was cancelled, not green;
record a new run's actual result separately.

## Live Railway deployment — 2026-11-06

- Project `cdc6c85c-775d-4923-bd02-2f4f01140bc3`, production environment
  `80c707e2-9003-4025-b793-232c427e2d85`, service
  `7f6187ef-ae65-46cf-b8d2-800acf4bdd3c`. The service has one replica and
  volume `c226849b-b812-44d4-bd1b-512418b71b45` at `/app/storage`.
- A private generated `APP_KEY` was supplied through Railway stdin, without
  printing or committing it. IaC applied the production variables, GitHub source,
  healthcheck and volume. A subsequent `railway config plan` found no changes.
- The first attempts failed Dockerfile validation because Railway's builder did
  not accept the optional BuildKit mounts. The portable Dockerfile was pushed as
  `c49abb8872131eb8b4fb7601624453f627b4f1de`. Deployment
  `b5b285f5-ddd7-4e2d-81f1-7f3b600e98f8` reached `SUCCESS` and its
  `/up?checks=1` healthcheck passed. The app reported SQLite migrations for
  lessons and learners and listened on Railway's runtime port 8080.
- Railway required `music.vukem.dev` to be registered separately from IaC. Its
  actual CNAME target is `dbuyirpj.up.railway.app`; Vercel DNS has that CNAME and
  the required `_railway-verify.music` TXT record. Railway reports the domain
  verified, the certificate valid and the target port set to 8080. The CNAME
  resolved through the authoritative Vercel server, Cloudflare, Google and Quad9.
- HTTPS with public DNS returned 200 for `/up?checks=1`, `/`, `/lessons`,
  `/library` and `/harmony`. The health response was
  `{"status":"ok","checks":{"db":"ok"}}`. A local Windows resolver still
  returned a cached Vercel wildcard address during verification; public DNS and
  DNS-over-HTTPS reached Railway correctly. That stale local cache will expire.
- The production `db:backup` command created a consistent snapshot on the volume.
  It was downloaded outside the repository, copied to a separate restore path
  and opened with SQLite: `integrity_check=ok`, eight lessons, two migrations.
  After deployment `6030df4e-bb18-4b97-82ad-89e1405e7c8b` reached `SUCCESS`,
  the same mounted database and first backup were still present. A fresh backup
  again had `integrity_check=ok`, eight lessons and two migrations. Production
  cutover to a restored volume was not exercised.
- Local `bun check`, `bun lint`, `bun lint:md` and `bun run test` passed; the
  production Docker image built successfully. `go vet ./...` passed. On Windows,
  `go test ./...` failed only the POSIX `0600` permission assertion, and
  `bun run build` requires the pinned Linux LilyPond binary. The remote
  [CI run](https://github.com/AlexGalhardo/vukem-music/actions/runs/42145857402)
  for `c49abb8` passed the Linux build and Go checks.

## Audio engineering documentation — 2026-11-06

Expanded `docs/audio.md` into the prompt ledger and sound-engine reference. It
includes both historical PCM requests' exact common prompt and all 17 current WAV
source prompts, API settings, the 17→11→8→88 source-selection facts, measured
register/transposition limitations, WAV/downmix/onset/YIN/resampling parameters,
browser synthesis/gain/compression, sample loading, transport, alternate tuning,
MIDI, microphone gating, memory estimates, failure behavior and remaining reviews.

Compared every expanded WAV prompt byte-for-byte with text captured from the
current request builder using a local stub; all 17 match. Source counts, frequency
range, selection counts, resampling extremes and file durations were checked
against the existing private bank/provenance without generating more audio.
Runtime parameters were checked against the implementation at `3e04910`.
Markdown lint is the applicable check for this documentation-only update; no
new audio generation, application behavior or listening approval is claimed.

## Vukem framework feedback — 2026-11-06

Created root `vukem-feedback.md` with 21 prioritized, evidence-based feedback items.
Cross-checked application source/history and framework revision 45a36f80e729,
including CLI key generation/rotation, doctor, Docker template, strict JSON binding
and optional/deferred Inertia props. The report distinguishes observed integration
friction, source inspection and unimplemented proposals; it does not claim an
upstream bug where the issue belongs to this application or its infrastructure.

This is a documentation-only change, checked with Markdown lint and whitespace/
local-link validation. No new deployment, framework patch, API generation or
runtime test result is implied.

## Release preparation — 2026-11-06

Inspected Vukem's `v0.37.0` release, workflow and GoReleaser configuration. The Music
pipeline adopts the same archive naming/platform matrix, categorized notes,
checksums, archive SPDX SBOMs, keyless checksum signature and GitHub provenance.
The initial version is `v0.1.0`; publication remains pending until observed.

Added strict version-specific changelog extraction, package-version agreement,
release documentation and binary `--version` build metadata. GoReleaser2.18.2 was
downloaded from its official release and its archive SHA-256 verified. Config
validation and release shell/YAML syntax validation passed. A Linux snapshot
built and printed version/commit/date without loading application credentials.
Windows-arm64 cross-compilation also passed; this was not a native Windows
runtime test.

Local frontend type check, production asset build, 27 unit tests/1,368 assertions,
Go race tests and vet passed. Initial CI investigation found that Biome also
formats Markdown tables: the earlier audio/feedback documents passed markdownlint
but failed Biome formatting. Those tables were formatted before publication.
Final local lint and exact-commit remote CI must pass before creating the release
tag. No existing CI failure is described as a successful release check.
