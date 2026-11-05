# Contributing to vukem-music

Thanks for helping out. This page is everything you need to get a change
merged.

## Set up

You need [Go](https://go.dev/dl/) (the version in `go.mod`) and the Vukem CLI
([installation](https://vukem.dev/docs/installation)). Then, from a clone:

```sh
bun run setup
vukem migrate
bun install
vukem serve
```

The app answers on <http://localhost:3000>.

## Before you open a pull request

```sh
gofmt -l .                 # must print nothing
go vet ./...
go test -race -count=1 ./...
go tool govulncheck ./...   # known vulnerabilities in the dependency tree
bun lint:md             # Markdown
```

Add or change a test with every behaviour change. The
[testing guide](https://vukem.dev/docs/testing/overview) covers the fluent
HTTP client, factories and the test database.

## Commits

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/),
in English:

```text
type(scope): description
```

- **type**: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`,
  `refactor`, `revert`, `style` or `test`.
- **scope**: optional, lowercase, the package or area you touched
  (`music`, `curriculum`, `deps`).
- **description**: imperative, lowercase start, no trailing period, and the
  whole header at most 100 characters.
- Breaking change: `!` after the type or scope, and a `BREAKING CHANGE:`
  footer explaining the impact.

One logical change per commit.
`CHANGELOG.md` is generated from these messages, so a vague header becomes a
vague release note.

The `commit-msg` hook in `.githooks/` checks the header and the `pre-commit`
hook runs `gofmt` and `go vet` on the staged Go files. They are already wired
up in a clone made by `vukem new`; in any other clone, run:

```sh
git config core.hooksPath .githooks
```

## Pull requests

- Branch off `main` and keep the branch focused on one change.
- Give the pull request a Conventional Commits title: it is what reviewers
  and the changelog read first.
- Describe what changes for a user of the app, not only what you edited.
- Say how you tested it.

## Code style

- `gofmt` decides formatting; do not argue with it.
- Comments explain _why_, not _what_. Skip the ones the code already says.
- Follow the framework's conventions: no globals, no `init()` registration,
  `context.Context` first
  ([architecture](https://vukem.dev/docs/architecture/lifecycle)).
- Code and commits in English; study references and brainstorming may be in Portuguese.
- User-facing curriculum and interface changes must support English and Portuguese.
- Run `bun check`, `bun lint`, `bun test`, and `bun run build` for frontend changes.
- Read `ROADMAP.md` and update verification evidence before handing work off.

## Reporting a bug

Open an issue with the version, the steps to reproduce and what you expected
instead. For anything security-related, follow
[SECURITY.md](SECURITY.md) instead of opening an issue.
