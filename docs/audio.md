# Piano audio production

## Current delivery

A private 88-key ElevenLabs-derived bank was created on 2026-11-06: A0–C8,
MIDI21–108, WAV PCM16 mono at 44.1kHz. All 88 files passed automated pitch,
silence/clipping and SHA-256 checks; maximum measured deviation is2.998 cents.
Seventeen generated source recordings were cached; eleven passed source selection.
Every final key records its source, measured fundamental and resampling ratio.
Listening review remains pending, especially for extreme transpositions.

The bank lives in ignored `storage/audio-bank/elevenlabs-piano`. A private ZIP,
including the original source WAVs, is available in the workspace artifacts folder.
Neither the ZIP nor recordings are committed. The public app's manifest stays
empty and its synthesized preview remains explicitly labeled.

## Distribution restriction

[ElevenCreative terms, Exhibit 4 §2](https://elevenlabs.io/creative-terms) permit
incorporation into applications subject to their terms, but expressly restrict
making Sound Effects available as isolated audio files/samples or sound libraries.
A paid Creator plan was observed during generation; that does not remove this
restriction. These recordings are not relicensed MIT. Do not publish the bank,
raw sources or private ZIP in the open source repository or a public sample URL.
Obtain written permission for that distribution, or select an appropriately
licensed alternative for the public app. The generation code remains MIT.

## Private credentials

Use Bun 1.4.4 and FFmpeg with libsoxr on a trusted development machine. Configure
`ELEVENLABS_API_KEY` in the environment or ignored `.env`; never in Vite, frontend
props, committed files or reports. No key is needed to play an existing WAV or
verify the private bank. Cached source files also permit offline reconstruction.

Check presence without printing the value:

```sh
bun -e 'console.log(Boolean(process.env.ELEVENLABS_API_KEY) ? "configured" : "missing")'
```

The maintainer explicitly authorized creating the application audio. Every command
still requires a finite request limit and skips cached source responses. The CLI
never automatically repeats a billed request. A limit bounds calls, not currency
cost. Ordinary application playback never calls ElevenLabs. The exposed chat key
can be revoked after generation; it is absent from Git and the private ZIP.

## Full bank

Preview the source anchors without requests:

```sh
bun run audio:bank
```

Generate missing source anchors and build all 88 keys:

```sh
bun run audio:bank --generate --limit 17
bun run audio:verify
```

The source anchors span the keyboard. The CLI requests three-second isolated piano
notes using `eleven_text_to_sound_v3` and `wav_44100`, preserving the raw response
before validation. WAV headers identify stereo channels correctly; downmix keeps
the original time scale. Cached invalid responses remain available for inspection,
without silently charging for a replacement. Authentication/rate-limit errors stop
new requests. Source stability is checked over three analysis windows.

Generative prompts do not guarantee the requested pitch. The offline processing
therefore measures each source, selects a nearby usable source for each key, trims
leading silence and uses libsoxr resampling to tune it. Up to four offline passes
refine the estimate; the final bank targets an absolute error below 5 cents.
There is no synthetic replacement in these files. Pitch shifting changes decay
and can introduce perceptual artifacts at large intervals; automated fundamental
checks cannot establish artistic quality or exclude every unwanted overtone.

All 88 WAVs are staged and checked before the final private manifest is replaced.
`provenance.json` records hashes, source mapping, adjustments and pending listening
review. `verification.json` records the measured integrity/pitch result. Keep the
original sources and these records when archiving the bank.

## Individual notes and strict audit

A single-note command remains available for controlled experiments:

```sh
bun run audio:generate --from 60 --to 60 --limit 1 --generate
bun run audio:generate --from 60 --to 60 --limit 1 --generate --retune
```

The first command applies the strict20-cent audit to the generated pitch; the
second explicitly enables offline correction. Results go to ignored
`storage/audio-bank/individual`, never public assets. Failed results remain cached
and reported. Missing individual source responses require the API key.

## Listening review

Listen to every final key for piano timbre, extraneous notes/noise, onset, decay
and consistent dynamics. Record that review separately from pitch checks. The
roadmap's listening/distribution assertions remain open. No billed generation or
human listening approval is claimed merely because an application build passes.

References: [Sound Effects API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert),
[Sound Effects output terms](https://elevenlabs.io/creative-terms).
