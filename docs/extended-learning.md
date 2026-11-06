# Extended learning, import and instruments

The full-roadmap request authorizes these additions. Anonymous learning remains
the default. All views support English and Brazilian Portuguese.

## Course and assessment

`/course` contains 58 original bilingual topic cards, one independently authored
review question per topic, interval identification and note construction. The
questions cover the reference chapter sequence without copying its exercises.
Ten-question rounds rotate through the bank. Eight correct answers is a disclosed
practice threshold for that round, not certification of musical proficiency.
Reading completion, attempts, correct answers and best round remain distinct.

Scale construction preserves diatonic spelling; interval number and quality are
computed independently from semitone distance. Chord answers may reorder notes.
Whole-tone construction accepts enharmonic alternatives because its spelling is
not unique. Modal and minor-scale variants are explicitly named. `/harmony` adds
ninths and altered dominants to its original examples and chord explorer.

The semantic library also includes a common-practice parallel-perfect-interval
check. It is a contextual teaching criterion, not a universal prohibition. This
technical implementation and its fixtures do not replace independent specialist
review; that roadmap assertion remains pending. The 58 cards are concise study
references, not a substitute for extended guided instruction.

## MusicXML import

`/import` reads uncompressed `.xml` or `.musicxml` in this browser. It does not
upload the file. The parser accepts score-partwise documents, up to 2 MiB, 16
parts, 512 measures, 64 XML levels and 100,000 XML nodes. Performance is limited
to one hour, 100,000 expanded events and 32 simultaneous voices. Piano pitches
must lie within MIDI21–108. DTDs, entities, external references, images and links
are rejected before engraving. MXL archives and score-timewise are unsupported.

Written and concert pitch, transposing instruments, voices, staves, chords,
rests, backup/forward offsets and rational durations remain separate. Triplet
and dotted timing follows MusicXML's explicit duration/divisions values. Ties
require a matching voice and contiguous pitch. Finite repeat signs (2–4 passes)
and first/second endings are supported with a 4,096-step traversal limit.
Nested repeats, navigation jumps, polymeter and imported grace execution are
blocked rather than guessed. Meter mismatches and unperformed ornaments,
technical instructions, pedal and hairpins are reported before playback.

OpenSheetMusicDisplay engraves validated XML as SVG. The renderer receives an
XML Document, never an inferred URL. AudioContext drives polyphonic playback;
SVG locations are mapped from musical time, not pixel position. Imported scores
use one selected quarter-note BPM: printed tempo changes are disclosed but not
performed. Slurs are visual phrasing; staccato changes the gate. Engraving a
symbol does not imply full interpretive execution. The original demos cover
simultaneous voices and dots/triplets/ties/rests separately.

Audio-only transposition leaves written notation intact and changes sounding
keys. Equal temperament uses A4=440Hz. Fixed-C just and Pythagorean comparisons
anchor C4 to its equal-tempered frequency: A4 can differ from 440Hz. These are
static demonstrations, not adaptive intonation for every key. A compressor bounds
combined output; it does not establish acoustic sound-pressure levels.

## MIDI and microphone

`/instruments` requests Web MIDI only after a click, with SysEx disabled. Devices,
channels and repeated attacks have independent lifecycle state. Velocity, sustain,
pedal release, note-on velocity zero, all-notes-off and disconnect are handled.
Blur, hidden tabs and unmount stop voices; background messages cannot restart
sound until focus returns. At most 32 held voices are retained. Unsupported
browsers keep the regular mouse/touch/computer-keyboard piano.

Microphone access is separate and opt-in. Audio stays in an in-memory analyser;
there is no recording, upload or account association. Stop, blur, hidden tabs and
navigation release tracks, including permission requests resolved after stopping.
The monophonic estimator reports pitch/cents/confidence after three stable frames;
quiet/noisy signals can produce no estimate. It targets roughly 80–1,200Hz and
cannot reliably grade polyphony, instrument timbre or octave ambiguity. Confidence
is a periodicity estimate, not a correctness probability. No microphone estimate
automatically awards a correct answer. Browser tests use a synthetic local tone;
real devices and room acoustics still need field evaluation.
