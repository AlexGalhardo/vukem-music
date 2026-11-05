# Vukem Music

An open source music theory learning project built with [Vukem](https://vukem.dev),
Go, Inertia.js, React and SQLite. English is the default locale; Brazilian
Portuguese is supported. The initial structure is published first; implementation
progress and verified delivery criteria live in [ROADMAP.md](ROADMAP.md).

## Development

Requirements: Go 1.27.3 and Bun 1.4.4.

```sh
bun install --frozen-lockfile
cp .env.example .env
go run ./cmd/app key:generate
go run ./cmd/app migrate
bun run build
go run ./cmd/app
```

Open <http://localhost:3000>. For frontend development, run `bun dev` in another
terminal. Never expose the development server publicly.

## Quality

```sh
bun check
bun lint
bun lint:md
bun run build
go test ./...
go vet ./...
```

See [contributing](CONTRIBUTING.md), [security](SECURITY.md),
[code of conduct](CODE_OF_CONDUCT.md), and [MIT license](LICENSE.md).

## Learning references

[Brainstorming](docs/brainstorming.md) records scope and assumptions. The
[study index](docs/study-reference.md) covers all 58 chapters of Bohumil Med’s
_Teoria da Música_, 5th edition, with original notes. The book and OCR are excluded.
All extracted text was read; graphical scores were checked only by sampling.
