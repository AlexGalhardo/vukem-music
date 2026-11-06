# Working on Vukem Music

Read `ROADMAP.md` first, then `docs/brainstorming.md`. Select the first unblocked
unchecked task. Maintain the roadmap and record evidence in `docs/verification.md`.

- Backend is Vukem (Go); frontend is Inertia + React + shadcn/ui. SQLite is primary.
- English is the default locale. Every user-facing change also supports pt-BR.
- Run `bun check`, `bun lint`, `bun lint:md`, `bun test`, `bun run build`,
  `go test ./...`, and `go vet ./...` for relevant implementation work.
- Do not commit secrets, SQLite runtime files, PDFs, OCR, node_modules or builds.
- Keep educational text and exercises original. Cite source sections; never copy
  the reference book's exercises or claim exhaustive visual score verification.
- Model score time independently from screen position; AudioContext is playback's
  clock. Written pitch and sounding pitch are separate concepts.
- Maintain no-account local progress. Auth/import/MIDI are explicitly authorized by the full-roadmap request; keep
  their privacy, ownership and supported-feature contracts documented.
- Commit messages use Conventional Commits. Push only to the requested origin.
- Mark external generation/deployment done only after observing the real outcome.
