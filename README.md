# Vukem Music

Learn music theory by reading, listening and playing. An open source learning
studio built with [Vukem](https://vukem.dev), Go, Inertia.js, React, shadcn/ui and
SQLite. English is the default locale; Brazilian Portuguese is supported.

## What works

- Eight original bilingual beginner lessons, installed into SQLite by migration.
- Responsive sidebar dashboard, light/dark themes and browser-local progress.
- Original SVG scores with treble/bass clefs, note-reading exercises and feedback.
- An interactive 88-key SVG piano with touch, mouse and computer-keyboard input.
- Web Audio playback synchronized with score and piano highlighting, including
  pause/resume, stop, rests, tempo controls and horizontal following on small screens.
- A searchable 50-work classical score library with difficulty, sources and edition licenses.
- A chord explorer with simultaneous audio, staff and piano display, plus twelve
  bilingual topics covering triads, inversions, sevenths, cadences and modulation.
- A 58-topic bilingual course with review rounds and semantic interval/scale exercises.
- Local MusicXML engraving/polyphonic playback, transposition and tuning comparisons.
- Optional account synchronization, JSON backup, opt-in MIDI and local microphone estimates.
- Server/CLI ElevenLabs sample generation with bounded requests and tuning checks.
  An 88-key bank was generated privately; provider terms restrict public sample
  redistribution. The public UI retains its identified synthesized preview.
- Railway deployment configuration, a multi-stage production image and SQLite backup.

[ROADMAP.md](ROADMAP.md) is the primary execution/handoff file. The application is
deployed at [music.vukem.dev](https://music.vukem.dev) with persistent Railway SQLite.
The private 88-key piano bank passed tuning checks; listening review and public
distribution permission are still pending. The public UI uses its labeled preview.
The extended course, browser-local MusicXML import, optional accounts, MIDI and
microphone exploration are implemented; see their documented support limits.
The library publishes 20 playable source editions. Thirty new transcriptions
remain review drafts outside production until notation/content review is complete.

## Releases

Prebuilt packages and verification instructions are documented in
[releases](docs/releases.md). Release notes follow [CHANGELOG.md](CHANGELOG.md).

## Start locally

Requirements: Go 1.27.3 and Bun 1.4.4. The score build downloads the pinned
LilyPond compiler on Linux x86-64; other platforms need LilyPond2.26.0 via
`LILYPOND_BIN`, or Docker. No ElevenLabs key is required for the preview.

```sh
bun install --frozen-lockfile
bun run setup
go run ./cmd/app migrate
bun run build
go run ./cmd/app
```

Open <http://localhost:3000>. For frontend development, run `bun dev` in another
terminal. Never expose the development server publicly. Do not commit `.env` or
runtime SQLite files. The curriculum lives on the server; learner progress stays
in this browser by default. Optional accounts provide explicit save/restore
across devices; JSON export/import also works without an account.

## Quality

```sh
bun check
bun lint
bun lint:md
bun run test
bun run build
go test -race -count=1 ./...
go vet ./...
go tool govulncheck ./...
```

Browser journeys use Playwright. Build the frontend first:

```sh
bun x playwright install chromium
bun run test:e2e
```

Playwright starts the application and runs migrations automatically. Configure a
local `.env` and key first. To use an existing Chromium install, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. `E2E_PORT` selects an
isolated test port; Playwright starts with a private ephemeral key when needed.
See the recorded results in
[verification](docs/verification.md).

## Project references

- [Brainstorming and decisions](docs/brainstorming.md).
- [Architecture and supported score subset](docs/architecture.md).
- [50-score research catalog](docs/repertoire-50.md).
- [Harmony learning path](docs/harmony-learning-path.md).
- [Extended learning and import limits](docs/extended-learning.md).
- [Accounts and progress portability](docs/accounts.md).
- [Reproducible score engraving](docs/score-build.md).
- [Piano sample generation](docs/audio.md).
- [Railway, persistence, backups and restore](docs/deployment.md).
- [Study references](docs/study-reference.md): original notes for all 58 chapters
  of Bohumil Med’s _Teoria da Música_, 5th edition, and its final sections.

The book, OCR and original exercises are excluded. All extracted text was read;
graphical scores were checked only by sampling. Educational material here is
original and does not replace the book or claim exhaustive visual verification.

See [contributing](CONTRIBUTING.md), [security](SECURITY.md),
[code of conduct](CODE_OF_CONDUCT.md), and [MIT license](LICENSE.md).
