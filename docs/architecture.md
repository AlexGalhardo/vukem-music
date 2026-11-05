# Architecture and supported scope

## Request and persistence flow

Vukem handles HTTP, security middleware, SQLite, migrations and Inertia rendering.
The `lessons` table stores versioned JSON documents with original EN/PT prose and
score events. An initial migration installs eight lessons transactionally. Startup
runs pending migrations; it does not reseed or overwrite the curriculum on each
request. To change already-installed lessons, add an explicit data migration.

React receives curriculum through Inertia props. Browser requests are read-only;
there are no public admin, generation, account or upload endpoints. Locale comes
from Vukem's resolver and is propagated in navigation URLs. Catalogs and course
content are embedded in production binaries. Vite bundles the frontend.

Learning progress uses a versioned localStorage document, validated on load.
Completion is idempotent. Counters record attempts and correct answers, and progress
can be reset after confirmation. Storage failure falls back to memory for that
visit; local progress is never described as a server backup.

## Musical model

Written pitch is `{ step, octave, alter }`; MIDI is derived for sounding pitch.
MIDI60=C4, MIDI69=A4=440Hz; tuning is 12-tone equal temperament. EN/PT labels do not
change the pitch or the scientific octave convention. Duration is a positive
rational fraction of a whole note; quarter-note beats derive from it. Scores keep
independent event IDs for visual and temporal identity.

The initial renderer/player supports monophonic, original 4/4 studies in treble
and bass clefs, natural notes and explicit single accidentals, whole/half/quarter/
eighth duration notation and basic rests. Current lessons use half and quarter
values. This is a bounded study renderer, not a general-purpose engraving engine.
Key signatures, measure-wide accidental inference, ties, slurs, tuplets, multiple
voices, repeats, pedal and file import are not implemented. Do not accept arbitrary
scores or imply support for these features without extending and testing the model.

## Playback lifecycle

AudioContext time is authoritative. On play, schedule the remaining events from
the current offset; requestAnimationFrame only reads that clock to highlight the
current score event and piano key. A rest occupies time with no active key. Pause
cancels voices and stores the audio-clock offset; resume schedules the remaining
part of a sustained event. Stop resets position. A score or tempo change resets
playback. Navigation/unmount cancels voices and closes the context; hiding the tab
pauses playback. Blur releases manually held keys.

No playback request calls ElevenLabs. A validated complete 88-sample bank is loaded
from the same origin. Until that bank exists, an additive synthesis preview is
clearly labeled. A failed sample download also falls back with a visible message.
The preview is not claimed to be a generated classical-piano recording.

## Verification boundaries

Unit tests check musical arithmetic, timing boundaries, resume segments, local
state validation and audio generation/audit. HTTP tests exercise curriculum,
locales, missing lessons and healthcheck. Browser journeys check navigation,
progress reload, score/piano synchronization, rests and keyboard/mobile behavior.
A browser test cannot replace a listening review of generated audio or a specialist
review of educational notation. See the execution assertions in `ROADMAP.md`.
