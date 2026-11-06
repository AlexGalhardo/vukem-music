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
  The maintainer subsequently approved all three round-2 proposals explicitly:
  validated ElevenLabs samples with an identified synthesis fallback, the proposed
  learning progression and 88-key piano, and a conservatory-style light/dark
  interface with touch, mouse and computer keyboard. The subsequent full-roadmap
  instruction also authorizes MIDI/microphone and the other extended phases.
- MVP includes local progress and original scores. Extended phases are explicitly
  authorized while preserving anonymous use as the default.

## Phase 0 — discovery and reference

- [x] Capture project requirements and interview answers.
  - [x] Record confirmed MVP, no-account progress and MIT decision.
    - [x] Keep the user’s actual answers distinct from implementation assumptions.
  - [x] Record assumptions and unanswered questions separately.
  - [x] Assert: `docs/brainstorming.md` identifies approved vs assumed decisions.
- [x] Read the reference book's extracted text.
  - [x] Download the 424-page reference outside the repository.
  - [x] OCR and read all extracted text; inspect notation by sampling.
    - [x] Record the 424-page coverage and the graphical-verification limitation.
  - [x] Assert: disclose that graphical examples were not exhaustively verified.
- [x] Publish original study references for all 58 chapters and final sections.
  - [x] Map each chapter to source pages, concepts and application implications.
    - [x] Write `study-01.md` through `study-58.md` and a navigable study index.
  - [x] Explain notation, tuning and historical-convention limitations.
  - [x] Assert: documentation index covers chapters 1–58 without copied exercises.

## Phase 1 — runnable foundation and initial GitHub push

- [x] Generate the official Vukem React/Inertia starter.
  - [x] Pin framework and dependency versions; keep a Bun lockfile.
    - [x] Resolve the official Go module; verify frozen Bun installation.
  - [x] Use SQLite and remove unrelated starter CRUD/demo features.
  - [x] Assert: Go build/tests and frontend install/type checking pass.
- [x] Configure open source quality standards.
  - [x] Add MIT `LICENSE.md`, security policy, code of conduct and contribution guide.
  - [x] Add Biome v2, markdownlint, `bun check`, CI and dependency updates.
  - [x] Add `.env.example`, safe ignores and repeatable developer commands.
    - [x] Prepare private `.env` setup without printing or rotating an existing APP_KEY.
  - [x] Assert: no secrets, book assets, databases or local path replacements tracked.
  - [x] Record framework evolution feedback with evidence and acceptance criteria
    in `vukem-feedback.md`; distinguish proposals from confirmed defects.
- [x] Publish the initial structure.
  - [x] Initialize `main` and set the requested GitHub origin.
  - [x] Commit and push the validated foundation.
  - [x] Assert: remote `main` points to the initial commit; capture commit URL.

## Phase 2 — curriculum, SQLite and bilingual dashboard

- [x] Store and serve an original beginner curriculum through Vukem and SQLite.
  - [x] Add idempotent schema/data initialization and read-only lesson access.
    - [x] Create the lessons table, unique slugs and versioned bilingual JSON records.
    - [x] Install eight lessons once by migration; reject missing lesson routes with 404.
  - [x] Supply EN/PT content for notes, staff, clefs, rhythm and meter.
  - [x] Assert: a clean database loads the same curriculum after restart.
- [x] Build shadcn/ui dashboard with responsive sidebar.
  - [x] Provide overview, lessons, piano practice and progress views.
  - [x] Add locale switch, English default and persisted light/dark preference.
    - [x] Embed EN/PT catalogs and preserve locale during Inertia navigation.
  - [x] Add semantic controls, visible focus and accessible names.
  - [x] Assert: routes load directly and via Inertia; EN/PT flows have translated UI.
- [x] Save learner progress locally.
  - [x] Version and validate stored state; survive unavailable/corrupt storage.
    - [x] Reject malformed counters/version data and fall back to in-memory progress.
  - [x] Track lesson completion and exercise results with a reset action.
  - [x] Assert: reload preserves progress; malformed data does not crash the app.

## Phase 3 — notation, piano and synchronized audio

- [x] Implement a tested musical event model.
  - [x] Separate written pitch/MIDI and rational duration.
    - [x] Retain diatonic spelling and explicit alteration independently from MIDI.
  - [x] Define MIDI60=C4, A4=440Hz, 12-TET and quarter-note BPM explicitly.
  - [x] Assert: known frequencies, dotted values, rests and event boundaries pass.
- [x] Render original study scores and 88-key SVG piano.
  - [x] Render treble/bass staves, ledger lines, notes, rests and bar lines.
  - [x] Support touch, mouse, computer keyboard and accessible key labels.
    - [x] Map A/W/S… to C4–C5; use arrow focus and Enter/Space for SVG keys.
    - [x] Follow active notes horizontally without scrolling the whole page vertically.
  - [x] Assert: active score events and piano keys share the same event IDs/pitches.
- [x] Implement Web Audio transport.
  - [x] Schedule sound using AudioContext time; derive visual state from that clock.
    - [x] Create a timed event list; preserve original event ends on resume.
  - [x] Add play/pause/resume/stop, tempo, replay and sample loading states.
  - [x] Cancel scheduled sounds on stop/navigation and release held notes on blur.
  - [x] Assert: transport timing, pause offset, rests and cleanup are tested.
- [x] Add ElevenLabs sample production and validation tooling.
  - [x] Keep API key server-side; cache files and bound generation/retries.
  - [x] Validate tuning and onset before a sample becomes playable.
    - [x] Reject silence/clipping/wrong pitch; atomically write accepted WAV and manifest.
  - [x] Mark synthesis fallback honestly; no billed generation on ordinary playback.
  - [x] Assert: generation request/error paths are tested without a real API key.
- [ ] Generate and approve real piano samples.
  - [x] Supply the private credential and authorize the bounded audio task.
    - [x] Configure the key outside Git; dry-run MIDI range and request limit.
  - [x] Create all 88 private WAVs; audit tuning/integrity and record provenance.
    - [x] Generate/cache17 source anchors; select 11 usable sources and tune all keys.
    - [x] Verify all 88 hashes/pitches; maximum measured error 2.998 cents.
  - [ ] Complete the listening/timbre review.
  - [ ] Resolve distribution permission before publishing isolated sample assets.
  - [ ] Assert: all declared samples pass pitch checks and a listening review.
  - Dependency: human listening review and permission for sample distribution.
    ElevenCreative Exhibit 4 §2 restricts isolated samples/libraries; the bank is
    private and the public application retains its identified synthesis preview.

## Phase 4 — learning interactions and product verification

- [x] Deliver beginner reading exercises with original questions.
  - [x] Match answers to score pitches and show explanations/feedback.
    - [x] Accept name buttons and piano input; save each evaluated answer once.
  - [x] Save results locally and surface meaningful progress.
  - [x] Assert: correct/incorrect answers and completion persist across reloads.
- [x] Verify full browser journeys.
  - [x] Exercise lessons, localization, theme, piano and transport.
  - [x] Test desktop/mobile layouts and keyboard interaction.
    - [x] Run the four Playwright journeys with a clean browser context.
  - [x] Assert: browser tests, type checks, lint, build and Go checks pass together.
- [x] Document operation and limitations.
  - [x] Explain supported score subset and source-book review limitations.
  - [x] Document exact ElevenLabs prompts and the complete audio signal pipeline.
    - [x] Compare all 17 WAV prompts with the request builder; record the historical
      PCM prompt, source/retuning limits and private-bank distribution boundary.
  - [x] Document audio generation, restore, updates and troubleshooting.
  - [x] Assert: a contributor can start from README without undocumented local paths.

## Phase 5 — Railway delivery and final publication

- [x] Prepare Railway deployment for SQLite.
  - [x] Build frontend and Go application in a multi-stage image.
  - [x] Configure persistent `/app/storage`, startup migrations and healthcheck.
    - [x] Use one SQLite replica; run migrations in the volume-mounted service.
  - [x] Document secrets, volume permissions, single-writer operation and backups.
  - [x] Assert: production build runs and healthcheck succeeds with a fresh DB.
- [x] Deploy at `music.vukem.dev`.
  - [x] Use authorized Railway project/access and production secret values.
  - [x] Mount the volume and configure the custom domain and DNS.
    - [x] Obtain Railway’s actual target; configure its DNS record and verify HTTPS.
  - [x] Verify HTTPS, persistence across redeploy and backup/restore.
  - [x] Assert: live domain serves the app and data survives a deployment.
- [x] Push implementation and inspect remote CI.
  - [x] Commit verified changes and push to the requested repository.
  - [x] Review workflow results and fix failures in scope.
  - [x] Assert: remote SHA matches local HEAD and CI result is recorded accurately.

## GitHub release delivery

- [ ] Publish the initial release using the Vukem release pattern.
  - [x] Inspect the reference release assets, workflow and categorized notes.
  - [x] Prepare GoReleaser, changelog extraction, CI gate and release verification docs.
  - [x] Exclude secrets, runtime data, PDFs/OCR and restricted generated audio.
  - [ ] Build and verify all six platform archives, checksums, SBOMs, signature and provenance.
  - [ ] Publish `v0.1.0` only after successful CI for its exact commit.
  - [ ] Assert: observe the published release and its fifteen uploaded assets; record its URL.

## Extended delivery — now explicitly authorized

The maintainer explicitly requested completion of the entire roadmap after the
repertoire delivery. All remaining software phases are now authorized, including
optional accounts/import/instrument input. Anonymous learning remains the default.
Continue independent work while service access and external reviews are pending.

### Phase 6 — curriculum beyond foundations

The maintainer explicitly reprioritized the 50-score library and introductory
harmony on 2026-11-05, before external generation/deployment blockers are resolved.
These deliveries extend the MVP; the full advanced curriculum remains below.

- [x] Research and acquire 50 distinct classical teaching works.
  - [x] Select historical/open editions and identify student vs teacher parts.
    - [x] Record source URLs, licenses, contributors, PDF pages and SHA-256 hashes.
    - [x] Keep PDFs outside Git; prepare a local 50-file study bundle.
  - [x] Assert: 50 distinct IDs, source attribution and bilingual teaching metadata.
- [x] Deliver `/library` with bilingual search and difficulty filters.
  - [x] Link to exact editions and disclose playback-conversion status.
    - [x] Separate beginner student duet parts from harder accompaniment.
  - [x] Assert: browser journey finds 50 works and filters by composer/difficulty.
- [x] Introduce chords and advanced harmony in `/harmony`.
  - [x] Add twelve original bilingual topics with worked examples and open tasks.
    - [x] Teach triads, inversions, sevenths, functions, cadences and voice leading.
    - [x] Introduce modes, secondary dominants, mixture, modulation and form.
  - [x] Add simultaneous chord audio, staff spelling and multi-key piano highlights.
    - [x] Preserve root vs bass, inversion and diminished-seventh double flats.
  - [x] Assert: fixed chord fixtures and bilingual browser interaction pass.
- [ ] Convert the selected repertoire to verified playable notation.
  - [x] Extend polyphonic score/event support before importing multi-voice piano works.
  - [ ] Retain edition licenses; compare every converted note/rhythm with its PDF.
    - [x] Model ties, repeats, clefs, meter and simultaneous voices explicitly.
  - [ ] Assert: source comparison, timing and piano/score/audio synchronization pass
    for every published playable work; PDF availability alone does not pass.
- [ ] Extend introductory harmony into a graded advanced learning sequence.
  - [ ] Obtain specialist review and author semantic exercises with valid alternatives.
    - [x] Add ninth/altered chords, harmonic-analysis examples and a contextual
      voice-leading evaluator.
    - [x] Keep reading completion distinct from demonstrated mastery.
  - [ ] Assert: reviewed bilingual explanations, contextual examples and meaningful
    evaluators; open questions are not counted as validated mastery.

- [ ] Add interval and scale modules (reference chapters 10–18, 21, 23–29, 31, 35).
  - [x] Define original bilingual lessons and semantic evaluators.
    - [x] Model interval number/quality independently from semitone distance.
    - [x] Generate correctly spelled scales; preserve modal and tonal context.
  - [ ] Assert: known interval/scale fixtures pass in EN/PT with expert content review.
- [ ] Add rhythm and expression modules (chapters 6–9, 19–20, 22, 28, 30, 32–39).
  - [x] Introduce features only after the score/player can represent them.
    - [x] Separate ties, slurs, articulations, tuplets and BPM-reference values.
    - [x] Teach interpretive conventions without claiming universal execution rules.
  - [x] Assert: original rhythm fixture preserves duration; unsupported execution
    features are reported. The broader specialist review remains pending.
- [ ] Add harmony, ornaments and notation modules (chapters 40–58).
  - [x] Use the original chapter references to plan independent exercises.
    - [x] Separate chord root, bass, inversion, voicing and tonal function.
    - [x] Accept musically equivalent answers where multiple solutions are valid.
  - [ ] Assert: all new topics have original EN/PT content, reviewed examples and evaluator tests.

### Phase 7 — score import

- [x] Add MusicXML import with explicit supported-feature reporting.
  - [x] Design a bounded parsing and validation pipeline.
    - [x] Enforce size/resource limits and reject unsafe XML/external entities.
    - [x] Preserve written/concert pitch, voices and rational duration on parse.
  - [x] Assert: malformed inputs fail safely; unsupported notation is reported before playback.

### Phase 8 — optional accounts and progress sync

- [x] Add authentication and cross-device progress without losing local progress.
  - [x] Design identity, ownership and migration semantics.
    - [x] Define local/server merge rules, deletion/export and conflict handling.
    - [x] Add authorized progress endpoints with CSRF and isolation checks.
  - [x] Assert: one learner cannot read another’s progress; offline/local migration is tested.

### Phase 9 — instrument input

- [x] Add MIDI input and sustain/velocity support.
  - [x] Design permission-based device connection and note lifecycle.
    - [x] Handle disconnects, all-notes-off, repeated note-ons and pedal release.
  - [x] Assert: no stuck notes after blur/disconnect; unsupported browsers retain manual input.
- [x] Explore optional microphone-based exercises.
  - [x] Define latency, tuning and privacy requirements before requesting access.
    - [x] Validate pitch detection against noise, octave errors and polyphony.
  - [x] Assert: explicit permission, reliable confidence reporting and no false correctness claim.

### Phase 10 — advanced playback and engraving

- [x] Add polyphony, repeats, transposition and alternate tuning.
  - [x] Extend notation and execution as independent representations.
    - [x] Bound repeat/jump execution to prevent loops; preserve event/voice identity.
    - [x] Separate written and concert pitch and model tuning beyond integer MIDI.
  - [x] Assert: reference scores, timing and voice-leading fixtures pass; unsupported
    features remain visible instead of silently producing incorrect sound.

## Current handoff

The full-roadmap instruction supersedes earlier future-scope limits. The extended
implementation adds the 58-topic bilingual course, semantic evaluators, MusicXML
import/engraving, polyphonic transport/transposition/tuning, optional SQLite account
sync, JSON portability, MIDI sustain/velocity and local microphone exploration.
Support limits are in [extended learning](docs/extended-learning.md) and
[account semantics](docs/accounts.md). Reading and review scores stay separate.

The library contains fifty researched works and twenty published study editions from
licensed Mutopia notation. Thirty Beyer/Reinagle transcriptions now exist as
review drafts, excluded from production assets and routes. Their source review
is unfinished; Reinagle No.5 bar12 has a documented unresolved bass reading.
Compiled editions pass MIDI/engraved-onset consistency checks, but that does not
satisfy the remaining source-PDF comparison for all fifty works. See
[score build](docs/score-build.md). Beyer No.7's PDF reference was corrected to
pages18–19; metadata and the outside-Git study bundle were updated.

Local validation: 24 unit tests/1,408 assertions, eleven browser journeys, frontend
build, Go race tests and vet passed for this extension. Final lint/image checks
and publication evidence are recorded in [verification](docs/verification.md).
The previous published implementation was `69c837f81443defa6925157379dbbb8cfa3b6d6a`;
its six CI jobs passed in [this run](https://github.com/AlexGalhardo/vukem-music/actions/runs/42084474571).
The extension was pushed as `0a1a06148d4f1337bf35510bab988b05f73506c1`.
Its image, Go, vulnerability, secret and Markdown jobs passed. Frontend type
checking found a test lookup needing an explicit guard; a correction is being
published. Record the follow-up CI result before claiming all jobs green.

Remaining work in dependency order:

1. Resolve Reinagle No.5 bar12 and review all thirty draft transcriptions.
   Compare every playable edition with its cited PDF,
   checking both hands, key/clef, rhythm, ties, repeat traversal and omissions.
2. Obtain independent specialist review of the bilingual advanced content and
   evaluators; do not present technical fixtures as that review.
3. Review the completed private ElevenLabs-derived 88-key bank by listening.
   All 88 WAVs now pass automated tuning/hash checks (maximum 2.998 cents).
   Preserve the private ZIP/source cache. Resolve the provider's explicit sample
   redistribution restriction before publishing or activating a public bank.
4. Deploy after authorized Railway project/access and DNS management are available;
   verify HTTPS, persistent volume, redeploy persistence and backup restore.

Do not mark external generation/deployment or independent reviews complete using
local configuration or automated consistency checks. Current service questions
are pending; never ask the maintainer to paste credentials in the chat. See
[audio](docs/audio.md), [deployment](docs/deployment.md) and the quality assertions
above before continuing. The entire roadmap is not yet complete.
