# Vukem Music — execution roadmap

This is the primary handoff file for future sessions and agents. Read this file,
[brainstorming](docs/brainstorming.md), and [AGENTS.md](AGENTS.md) before working.

## Execution rules

- Work in dependency order; choose the first unchecked, unblocked task.
- A checked box means the delivery exists and its assertion has passed. Never mark
  an external operation complete using only a local configuration file.
- Record evidence in `docs/verification.md`; update this file in the same commit.
- Keep code and original learning content MIT licensed. Never commit the source
  book, OCR text, credentials, runtime SQLite databases, or generated build output.
- Implementation was explicitly authorized on 2026-11-05, including GitHub push.
  Recommendations from interview round 2 are implementation assumptions, not
  individual answers: sample-based piano with identified synthesis fallback,
  88 keys, treble/bass fundamentals, light/dark interface, touch and keyboard.
- MVP includes local progress and original scores; accounts, score import, MIDI
  input and microphone recognition are future scope, not hidden MVP requirements.

## Phase 0 — discovery and reference

- [x] Capture project requirements and interview answers.
  - [x] Record confirmed MVP, no-account progress and MIT decision.
  - [x] Record assumptions and unanswered questions separately.
  - [x] Assert: `docs/brainstorming.md` identifies approved vs assumed decisions.
- [x] Read the reference book's extracted text.
  - [x] Download the 424-page reference outside the repository.
  - [x] OCR and read all extracted text; inspect notation by sampling.
  - [x] Assert: disclose that graphical examples were not exhaustively verified.
- [x] Publish original study references for all 58 chapters and final sections.
  - [x] Map each chapter to source pages, concepts and application implications.
  - [x] Explain notation, tuning and historical-convention limitations.
  - [x] Assert: documentation index covers chapters 1–58 without copied exercises.

## Phase 1 — runnable foundation and initial GitHub push

- [x] Generate the official Vukem React/Inertia starter.
  - [x] Pin framework and dependency versions; keep a Bun lockfile.
  - [ ] Use SQLite and remove unrelated starter CRUD/demo features.
  - [x] Assert: Go build/tests and frontend install/type checking pass.
- [ ] Configure open source quality standards.
  - [ ] Add MIT `LICENSE.md`, security policy, code of conduct and contribution guide.
  - [ ] Add Biome v2, markdownlint, `bun check`, CI and dependency updates.
  - [ ] Add `.env.example`, safe ignores and repeatable developer commands.
  - [ ] Assert: no secrets, book assets, databases or local path replacements tracked.
- [ ] Publish the initial structure.
  - [ ] Initialize `main` and set the requested GitHub origin.
  - [ ] Commit and push the validated foundation.
  - [ ] Assert: remote `main` points to the initial commit; capture commit URL.

## Phase 2 — curriculum, SQLite and bilingual dashboard

- [ ] Store and serve an original beginner curriculum through Vukem and SQLite.
  - [ ] Add idempotent schema/data initialization and read-only lesson access.
  - [ ] Supply EN/PT content for notes, staff, clefs, rhythm and meter.
  - [ ] Assert: a clean database loads the same curriculum after restart.
- [ ] Build shadcn/ui dashboard with responsive sidebar.
  - [ ] Provide overview, lessons, piano practice and progress views.
  - [ ] Add locale switch, English default and persisted light/dark preference.
  - [ ] Add semantic controls, visible focus and accessible names.
  - [ ] Assert: routes load directly and via Inertia; EN/PT flows have translated UI.
- [ ] Save learner progress locally.
  - [ ] Version and validate stored state; survive unavailable/corrupt storage.
  - [ ] Track lesson completion and exercise results with a reset action.
  - [ ] Assert: reload preserves progress; malformed data does not crash the app.

## Phase 3 — notation, piano and synchronized audio

- [ ] Implement a tested musical event model.
  - [ ] Separate written pitch/MIDI and rational duration.
  - [ ] Define MIDI60=C4, A4=440Hz, 12-TET and quarter-note BPM explicitly.
  - [ ] Assert: known frequencies, dotted values, rests and event boundaries pass.
- [ ] Render original study scores and 88-key SVG piano.
  - [ ] Render treble/bass staves, ledger lines, notes, rests and bar lines.
  - [ ] Support touch, mouse, computer keyboard and accessible key labels.
  - [ ] Assert: active score events and piano keys share the same event IDs/pitches.
- [ ] Implement Web Audio transport.
  - [ ] Schedule sound using AudioContext time; derive visual state from that clock.
  - [ ] Add play/pause/resume/stop, tempo, replay and sample loading states.
  - [ ] Cancel scheduled sounds on stop/navigation and release held notes on blur.
  - [ ] Assert: transport timing, pause offset, rests and cleanup are tested.
- [ ] Add ElevenLabs sample production and validation tooling.
  - [ ] Keep API key server-side; cache files and bound generation/retries.
  - [ ] Validate tuning and onset before a sample becomes playable.
  - [ ] Mark synthesis fallback honestly; no billed generation on ordinary playback.
  - [ ] Assert: generation request/error paths are tested without a real API key.
- [ ] Generate and approve real piano samples.
  - [ ] Supply ElevenLabs credential and agreed generation budget.
  - [ ] Generate, audit tuning/timbre, publish manifest and asset provenance.
  - [ ] Assert: all declared samples pass pitch checks and a listening review.
  - Dependency: ElevenLabs access; do not substitute synthetic audio as completion.

## Phase 4 — learning interactions and product verification

- [ ] Deliver beginner reading exercises with original questions.
  - [ ] Match answers to score pitches and show explanations/feedback.
  - [ ] Save results locally and surface meaningful progress.
  - [ ] Assert: correct/incorrect answers and completion persist across reloads.
- [ ] Verify full browser journeys.
  - [ ] Exercise lessons, localization, theme, piano and transport.
  - [ ] Test desktop/mobile layouts and keyboard interaction.
  - [ ] Assert: browser tests, type checks, lint, build and Go checks pass together.
- [ ] Document operation and limitations.
  - [ ] Explain supported score subset and source-book review limitations.
  - [ ] Document audio generation, restore, updates and troubleshooting.
  - [ ] Assert: a contributor can start from README without undocumented local paths.

## Phase 5 — Railway delivery and final publication

- [ ] Prepare Railway deployment for SQLite.
  - [ ] Build frontend and Go application in a multi-stage image.
  - [ ] Configure persistent `/app/storage`, startup migrations and healthcheck.
  - [ ] Document secrets, volume permissions, single-writer operation and backups.
  - [ ] Assert: production build runs and healthcheck succeeds with a fresh DB.
- [ ] Deploy at `music.vukem.dev`.
  - [ ] Use authorized Railway project/access and production secret values.
  - [ ] Mount the volume and configure the custom domain and DNS.
  - [ ] Verify HTTPS, persistence across redeploy and backup/restore.
  - [ ] Assert: live domain serves the app and data survives a deployment.
  - Dependency: Railway/DNS access; local configuration does not satisfy this task.
- [ ] Push implementation and inspect remote CI.
  - [ ] Commit verified changes and push to the requested repository.
  - [ ] Review workflow results and fix failures in scope.
  - [ ] Assert: remote SHA matches local HEAD and CI result is recorded accurately.

## Future phases — explicitly outside the initial delivery

- [ ] Expand lessons/exercises to intervals, scales, modes, harmony and ornamentation.
  - [ ] Use chapter references to plan independently validated bilingual content.
  - [ ] Add tests for each new musical rule and original exercise evaluator.
  - [ ] Assert: unsupported notation is explicitly identified before playback.
- [ ] Add MusicXML import with format validation and supported-feature reporting.
- [ ] Add optional accounts and cross-device progress, with a migration plan.
- [ ] Add MIDI input, sustain/velocity and optional microphone-based exercises.
- [ ] Add advanced notation, polyphony, repeats, transposition and alternate tunings.

## Current handoff

Implementation in progress. External sample generation and live deployment require
service credentials that were not configured at initial inspection. Continue all
local implementation and verification; preserve explicit blockers for external work.
