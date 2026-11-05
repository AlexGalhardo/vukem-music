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
- Server/CLI ElevenLabs sample generation with bounded requests and tuning checks.
  Until an approved sample bank exists, the UI identifies its synthesized preview.
- Railway deployment configuration, a multi-stage production image and SQLite backup.

[ROADMAP.md](ROADMAP.md) is the primary execution/handoff file. External sample
production and live Railway/DNS setup remain explicitly blocked on service access.
Accounts, MusicXML import, MIDI input and advanced engraving are future scope.

## Start locally

Requirements: Go 1.27.3 and Bun 1.4.4. No ElevenLabs key is required for the preview.

```sh
bun install --frozen-lockfile
cp .env.example .env
go run ./cmd/app key:generate
go run ./cmd/app migrate
bun run build
go run ./cmd/app
```

Open <http://localhost:3000>. For frontend development, run `bun dev` in another
terminal. Never expose the development server publicly. Do not commit `.env` or
runtime SQLite files. The curriculum lives on the server; learner progress stays
in this browser and does not sync between devices.

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
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. See the recorded results in
[verification](docs/verification.md).

## Project references

- [Brainstorming and decisions](docs/brainstorming.md).
- [Architecture and supported score subset](docs/architecture.md).
- [Piano sample generation](docs/audio.md).
- [Railway, persistence, backups and restore](docs/deployment.md).
- [Study references](docs/study-reference.md): original notes for all 58 chapters
  of Bohumil Med’s _Teoria da Música_, 5th edition, and its final sections.

The book, OCR and original exercises are excluded. All extracted text was read;
graphical scores were checked only by sampling. Educational material here is
original and does not replace the book or claim exhaustive visual verification.

See [contributing](CONTRIBUTING.md), [security](SECURITY.md),
[code of conduct](CODE_OF_CONDUCT.md), and [MIT license](LICENSE.md).
