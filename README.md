<div align="center">

<h1><strong><a href="https://music.vukem.dev" style="text-decoration: none" target="_blank">Vukem Music</a></strong></h1>

[![CI](https://github.com/AlexGalhardo/vukem-music/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexGalhardo/vukem-music/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Go 1.27.3](https://img.shields.io/badge/go-1.27.3-00ADD8?logo=go&logoColor=white)](go.mod)
<a href="https://github.com/AlexGalhardo/vukem-music/releases"><img src="https://img.shields.io/github/v/release/AlexGalhardo/vukem-music?include_prereleases&label=version" alt="Version"></a>
<a href="https://scorecard.dev/viewer/?uri=github.com/AlexGalhardo/vukem-music"><img src="https://api.scorecard.dev/projects/github.com/AlexGalhardo/vukem-music/badge" alt="OpenSSF Scorecard"></a>

<h3><strong>Open Source Music Theory Studio: Read, Listen and Play</strong></h3>

</div>

## Introduction

Vukem Music is an open source learning studio for music theory: read scores, listen to them and play them on an interactive piano. English is the default locale and Brazilian Portuguese is supported. It is deployed at [music.vukem.dev](https://music.vukem.dev) with persistent Railway SQLite.

This application is built using the [Vukem Go framework](https://vukem.dev), with Inertia.js, React, shadcn/ui and SQLite.

[ROADMAP.md](ROADMAP.md) is the primary execution and handoff file. The library publishes 20 playable source editions; thirty new transcriptions remain review drafts outside production until notation and content review is complete. The private 88-key piano bank passed tuning checks, but listening review and public distribution permission are still pending, so the public UI uses its labeled preview.

## Summary

- [Introduction](#introduction)
- [Features](#features)
- [Quick start](#quick-start)
- [Documentation](#documentation)
- [Stability](#stability)
- [Contributing](#contributing)
- [Code of conduct](#code-of-conduct)
- [Security vulnerabilities](#security-vulnerabilities)
- [License](#license)

## Features

- Eight original bilingual beginner lessons, installed into SQLite by migration.
- Responsive sidebar dashboard, light/dark themes and browser-local progress.
- Original SVG scores with treble/bass clefs, note-reading exercises and feedback.
- An interactive 88-key SVG piano with touch, mouse and computer-keyboard input.
- Web Audio playback synchronized with score and piano highlighting, including pause/resume, stop, rests, tempo controls and horizontal following on small screens.
- A searchable 50-work classical score library with difficulty, sources and edition licenses.
- A chord explorer with simultaneous audio, staff and piano display, plus twelve bilingual topics covering triads, inversions, sevenths, cadences and modulation.
- A 58-topic bilingual course with review rounds and semantic interval/scale exercises.
- Local MusicXML engraving/polyphonic playback, transposition and tuning comparisons.
- Optional account synchronization, JSON backup, opt-in MIDI and local microphone estimates.
- Server/CLI ElevenLabs sample generation with bounded requests and tuning checks. An 88-key bank was generated privately; provider terms restrict public sample redistribution.
- Railway deployment configuration, a multi-stage production image and SQLite backup.

## Quick start

Requirements: Go 1.27.3 and Bun 1.4.4. The score build downloads the pinned LilyPond compiler on Linux x86-64; other platforms need LilyPond 2.26.0 via `LILYPOND_BIN`, or Docker. No ElevenLabs key is required for the preview.

```sh
bun install --frozen-lockfile
bun run setup
go run ./cmd/app migrate
bun run build
go run ./cmd/app
```

Open <http://localhost:3000>. For frontend development, run `bun dev` in another terminal. Never expose the development server publicly. Do not commit `.env` or runtime SQLite files. The curriculum lives on the server; learner progress stays in this browser by default. Optional accounts provide explicit save/restore across devices; JSON export/import also works without an account.

## Documentation

- [Brainstorming and decisions](docs/brainstorming.md).
- [Architecture and supported score subset](docs/architecture.md).
- [50-score research catalog](docs/repertoire-50.md).
- [Harmony learning path](docs/harmony-learning-path.md).
- [Extended learning and import limits](docs/extended-learning.md).
- [Accounts and progress portability](docs/accounts.md).
- [Reproducible score engraving](docs/score-build.md).
- [Piano sample generation](docs/audio.md).
- [Railway, persistence, backups and restore](docs/deployment.md).
- [Verification results](docs/verification.md).
- [Study references](docs/study-reference.md): original notes for all 58 chapters of Bohumil Med’s _Teoria da Música_, 5th edition, and its final sections.

The book, OCR and original exercises are excluded. All extracted text was read; graphical scores were checked only by sampling. Educational material here is original and does not replace the book or claim exhaustive visual verification.

## Stability

Vukem Music follows [Semantic Versioning](https://semver.org) and tags releases as `vX.Y.Z` on `main`. Prebuilt packages and verification instructions are documented in [releases](docs/releases.md).

Changes are listed in [CHANGELOG.md](CHANGELOG.md), which follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Contributing

Thank you for considering a contribution to Vukem Music.

- Every user-facing change also supports pt-BR, and educational text and exercises stay original.
- Run the checks that cover your change before opening a pull request:

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

Browser journeys use Playwright; build the frontend first, then run `bun x playwright install chromium` and `bun run test:e2e`. Playwright starts the application and runs migrations automatically. `E2E_PORT` selects an isolated test port, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` reuses an existing Chromium. The full guide is in [CONTRIBUTING.md](CONTRIBUTING.md).

### Pull requests

1. Create a branch from `main`.
2. Make one logical change per commit.
3. Open a pull request against `main`.

`main` accepts changes through a pull request with green checks and linear history.

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) in English: `type(scope): description`.

- Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.

## Code of conduct

To keep the community welcoming to everyone, please review and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security vulnerabilities

If you discover a security vulnerability, please follow the [security policy](SECURITY.md) instead of opening a public issue.

## License

Vukem Music is open source software released under the [MIT license](LICENSE.md).
