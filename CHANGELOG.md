# Changelog

Release notes use the same categorized format as
[Vukem releases](https://github.com/AlexGalhardo/vukem/releases).
Versions below 1.0 describe the delivered scope, not completion of every roadmap item.

## [Unreleased]

## [0.1.0] - 2026-11-06

### Added

- **study:** Bilingual English/Portuguese learning studio with eight foundational SQLite lessons, 58 original topic references, review rounds and interval/scale/chord exercises.
- **piano:** Interactive 88-key SVG keyboard, synchronized score playback, polyphony, tempo, audio-only transposition and fixed-C tuning comparisons.
- **library:** Fifty researched classical teaching works with attribution and difficulty filters; twenty licensed notation editions available for synchronized playback.
- **import:** Browser-local MusicXML validation and SVG engraving, with explicit supported-feature reporting.
- **progress:** Anonymous browser progress, JSON backup/restore and optional SQLite accounts with explicit cross-device save/restore.
- **instruments:** Opt-in MIDI velocity/sustain input and local monophonic microphone estimates, without automatic correctness claims.
- **deployment:** Railway configuration, live HTTPS delivery, persistent SQLite volume and verified snapshot/restore procedures.
- **release:** Linux, macOS and Windows archives for amd64/arm64, SHA-256 checksums, SPDX SBOMs, keyless checksum signature and GitHub build provenance.

### Changed

- **scope:** Thirty handwritten score transcriptions remain review drafts, excluded from playable production assets; advanced educational content still needs independent specialist review.
- **audio:** The generated 88-key ElevenLabs-derived bank remains private because the provider restricts standalone sample distribution. The public application uses its labeled synthesized preview; listening approval is pending.
- **documentation:** Publish complete original study references, the exact audio prompt ledger and evidence-based framework feedback.

### Fixed

- **setup:** Preserve existing application keys and prepare clean CI/browser environments without printing credentials.
- **i18n:** Preserve selected chords, inversions and filters across Inertia locale navigation.
- **notation:** Keep imported XML from being inferred as a URL and exclude unreviewed score assets from production routes.
- **deployment:** Use portable Docker steps compatible with the observed Railway builder and run SQLite migrations after the persistent volume is mounted.

### Security

- **accounts:** Use framework session authentication, Argon2id, CSRF/origin protections, bounded input, rate limits and revision checks for progress writes.
- **import:** Reject unsafe XML/external entities and bound score resources and repeat execution.
- **assets:** Keep credentials, databases, source-book scans/OCR and restricted generated audio out of public release archives.

[Unreleased]: https://github.com/AlexGalhardo/vukem-music/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AlexGalhardo/vukem-music/releases/tag/v0.1.0
