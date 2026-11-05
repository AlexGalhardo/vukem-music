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
