# Piano audio production

## Current status

The manifest starts empty. The application uses an explicitly labeled synthesized
preview. No ElevenLabs notes were generated without credentials. A full 88-note
bank is required before the UI advertises validated piano samples.

## Generation

Use Bun 1.4.4 on a trusted development machine or server. Configure
`ELEVENLABS_API_KEY` in that process's environment or ignored `.env`; never put the
key in frontend props, Vite variables, committed files or issue reports.

### Configure the key in this workspace

Open `/workspace/vukem-music/.env` in the environment editor and fill the existing
`ELEVENLABS_API_KEY=` entry. Alternatively, use the environment's secret settings
with that exact variable name. Bun automatically loads the project `.env` when
running the CLI from the project directory. Never paste a key into chat or a
shell command that will be retained in history. Do not use a `VITE_` prefix.

A private terminal can also prompt without echoing the key or saving it in shell
history for that process's subsequent commands:

```sh
read -r -s -p 'ElevenLabs API key: ' ELEVENLABS_API_KEY
export ELEVENLABS_API_KEY
```

Verify presence without printing the value:

```sh
bun -e 'console.log(Boolean(process.env.ELEVENLABS_API_KEY) ? "configured" : "missing")'
```

The key enables requests; it does not approve an unlimited generation run.
Agree a numeric request cap before running `--generate`. A request limit bounds
attempts, not a guaranteed currency cost, which depends on the account's plan.
On Railway, configure the key as a service variable only if performing generation
there; ordinary browser playback does not need it.

### Preview and generation

Preview one request without billing:

```sh
bun audio:generate --from 60 --to 60
```

Generate a deliberately bounded batch after configuring the key:

```sh
bun audio:generate --from 60 --to 60 --limit 1 --generate
```

The CLI requests one three-second isolated piano note per missing MIDI value,
using ElevenLabs Sound Effects with `eleven_text_to_sound_v3` and PCM 44.1kHz.
It caches accepted notes and never automatically retries a failed billed request.
The default request limit is four; raising it is an explicit command-line choice.
MIDI21–108 spans the 88-key piano. Start with a small batch and inspect it before
requesting the entire range. Model prompts do not guarantee pitch accuracy.

Each result is checked for PCM size, silence, clipping, delayed attack and stable
fundamental within 20 cents. A YIN-style estimator validates the fundamental;
samples with wrong tuning are rejected rather than silently relabeled. The attack
is trimmed and PCM is wrapped in WAV. Accepted files and manifest entries are
written atomically. A cached entry is skipped on subsequent generation.

## Listening and distribution review

Listen to every accepted sample for piano timbre, extraneous notes/noise, attacks,
decay and consistency. Automated pitch checks do not establish artistic quality or
rule out all polyphonic output. Keep provenance and confirm asset distribution
terms before publishing generated audio in an open source repository. Record that
review in this file and in the roadmap; the MIT code license does not automatically
relicense third-party assets.

After approving all notes, rebuild the application so the WAV files and manifest
are embedded in the production binary. The browser requires exact sample URLs
`/audio/piano/<midi>.wav` and verified frequency metadata; external sample URLs are
not accepted. The server hosts the bank without sending API credentials.

Reference: [ElevenLabs Sound Effects API](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert).
