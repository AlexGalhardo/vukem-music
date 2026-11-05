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
  - [x] Use SQLite and remove unrelated starter CRUD/demo features.
  - [x] Assert: Go build/tests and frontend install/type checking pass.
- [x] Configure open source quality standards.
  - [x] Add MIT `LICENSE.md`, security policy, code of conduct and contribution guide.
  - [x] Add Biome v2, markdownlint, `bun check`, CI and dependency updates.
  - [x] Add `.env.example`, safe ignores and repeatable developer commands.
  - [x] Assert: no secrets, book assets, databases or local path replacements tracked.
- [x] Publish the initial structure.
  - [x] Initialize `main` and set the requested GitHub origin.
  - [x] Commit and push the validated foundation.
  - [x] Assert: remote `main` points to the initial commit; capture commit URL.

## Phase 2 — curriculum, SQLite and bilingual dashboard

- [x] Store and serve an original beginner curriculum through Vukem and SQLite.
  - [x] Add idempotent schema/data initialization and read-only lesson access.
  - [x] Supply EN/PT content for notes, staff, clefs, rhythm and meter.
  - [x] Assert: a clean database loads the same curriculum after restart.
- [x] Build shadcn/ui dashboard with responsive sidebar.
  - [x] Provide overview, lessons, piano practice and progress views.
  - [x] Add locale switch, English default and persisted light/dark preference.
  - [x] Add semantic controls, visible focus and accessible names.
  - [x] Assert: routes load directly and via Inertia; EN/PT flows have translated UI.
- [x] Save learner progress locally.
  - [x] Version and validate stored state; survive unavailable/corrupt storage.
  - [x] Track lesson completion and exercise results with a reset action.
  - [x] Assert: reload preserves progress; malformed data does not crash the app.

## Phase 3 — notation, piano and synchronized audio

- [x] Implement a tested musical event model.
  - [x] Separate written pitch/MIDI and rational duration.
  - [x] Define MIDI60=C4, A4=440Hz, 12-TET and quarter-note BPM explicitly.
  - [x] Assert: known frequencies, dotted values, rests and event boundaries pass.
- [x] Render original study scores and 88-key SVG piano.
  - [x] Render treble/bass staves, ledger lines, notes, rests and bar lines.
  - [x] Support touch, mouse, computer keyboard and accessible key labels.
  - [x] Assert: active score events and piano keys share the same event IDs/pitches.
- [x] Implement Web Audio transport.
  - [x] Schedule sound using AudioContext time; derive visual state from that clock.
  - [x] Add play/pause/resume/stop, tempo, replay and sample loading states.
  - [x] Cancel scheduled sounds on stop/navigation and release held notes on blur.
  - [x] Assert: transport timing, pause offset, rests and cleanup are tested.
- [x] Add ElevenLabs sample production and validation tooling.
  - [x] Keep API key server-side; cache files and bound generation/retries.
  - [x] Validate tuning and onset before a sample becomes playable.
  - [x] Mark synthesis fallback honestly; no billed generation on ordinary playback.
  - [x] Assert: generation request/error paths are tested without a real API key.
- [ ] Generate and approve real piano samples.
  - [ ] Supply ElevenLabs credential and agreed generation budget.
  - [ ] Generate, audit tuning/timbre, publish manifest and asset provenance.
  - [ ] Assert: all declared samples pass pitch checks and a listening review.
  - Dependency: ElevenLabs access; do not substitute synthetic audio as completion.

## Phase 4 — learning interactions and product verification

- [x] Deliver beginner reading exercises with original questions.
  - [x] Match answers to score pitches and show explanations/feedback.
  - [x] Save results locally and surface meaningful progress.
  - [x] Assert: correct/incorrect answers and completion persist across reloads.
- [x] Verify full browser journeys.
  - [x] Exercise lessons, localization, theme, piano and transport.
  - [x] Test desktop/mobile layouts and keyboard interaction.
  - [x] Assert: browser tests, type checks, lint, build and Go checks pass together.
- [x] Document operation and limitations.
  - [x] Explain supported score subset and source-book review limitations.
  - [x] Document audio generation, restore, updates and troubleshooting.
  - [x] Assert: a contributor can start from README without undocumented local paths.

## Phase 5 — Railway delivery and final publication

- [x] Prepare Railway deployment for SQLite.
  - [x] Build frontend and Go application in a multi-stage image.
  - [x] Configure persistent `/app/storage`, startup migrations and healthcheck.
  - [x] Document secrets, volume permissions, single-writer operation and backups.
  - [x] Assert: production build runs and healthcheck succeeds with a fresh DB.
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

The local MVP implementation covers phases 0–4 except real ElevenLabs sample
production. Initial structure was pushed as `1589912177179630fd2f0b2848729b4d2d053e2b`.
Production Docker, persistence and backup checks passed locally. Final implementation
publication and remote CI are being recorded.

External blockers: no `ELEVENLABS_API_KEY`, Railway credential/project, or DNS
management access was configured. Do not mark real audio generation or the live
custom-domain deployment complete. Continue the first unblocked task above;
accounts/import/MIDI/advanced lessons remain explicitly future scope.

See [verification evidence](docs/verification.md), [audio operation](docs/audio.md),
and [Railway operation](docs/deployment.md) for reproducible checks and next steps.
