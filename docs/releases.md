# Releases and binary installation

Vukem Music follows the [Vukem release layout](https://github.com/AlexGalhardo/vukem/releases):
a `vX.Y.Z` tag/title, categorized changelog notes and six platform archives, plus
checksums, one SPDX SBOM per archive, a keyless checksum signature and GitHub build
provenance. The first planned version is `v0.1.0`, matching `package.json`.
Pre-1.0 versions describe the delivered scope; they do not certify every roadmap
item, expert review or audio distribution permission as complete.

## Assets

| Platform      | Archive                                 |
| ------------- | --------------------------------------- |
| Linux amd64   | `vukem-music_0.1.0_linux_amd64.tar.gz`  |
| Linux arm64   | `vukem-music_0.1.0_linux_arm64.tar.gz`  |
| macOS amd64   | `vukem-music_0.1.0_darwin_amd64.tar.gz` |
| macOS arm64   | `vukem-music_0.1.0_darwin_arm64.tar.gz` |
| Windows amd64 | `vukem-music_0.1.0_windows_amd64.zip`   |
| Windows arm64 | `vukem-music_0.1.0_windows_arm64.zip`   |

Each archive has a matching `<archive>.sbom.json`. Other assets are `checksums.txt`,
`checksums.txt.sigstore.json` and `vukem-music.intoto.jsonl`. GitHub also provides its
automatic source ZIP/tarball. Binary archives contain the embedded public application,
licenses/notices, changelog, example configuration and notation source attribution.
They contain no actual `.env`, runtime database, PDF/OCR or restricted audio bank.

## Run a downloaded binary

No Go, Bun, LilyPond or FFmpeg installation is needed to run the prebuilt web app.
Those tools are needed only for the corresponding development/generation tasks.
Extract the correct archive into a new private directory. Keep the binary,
licenses and example configuration together. `--version` prints application build
metadata without requiring configuration or a database.

For a local Unix/macOS preview:

```sh
cp .env.example .env
chmod 600 .env
mkdir -p storage
export APP_KEY="$(./vukem-music key:generate)"
export HOST=127.0.0.1
./vukem-music --version
./vukem-music migrate
./vukem-music
```

The binary's `key:generate` prints a key; command substitution captures it without
printing it. The exported key belongs to that terminal session: preserve it
privately in your environment/secret manager before expecting accounts/sessions
to survive subsequent starts. Do not rotate it on every production startup.

For a Windows PowerShell preview:

```powershell
Copy-Item .env.example .env
New-Item -ItemType Directory -Force storage | Out-Null
$env:APP_KEY = (& .\vukem-music.exe key:generate).Trim()
$env:HOST = '127.0.0.1'
.\vukem-music.exe --version
.\vukem-music.exe migrate
.\vukem-music.exe
```

Open <http://localhost:3000>. This is a local preview, not a public production
configuration. For HTTPS, secrets, persistent storage, migrations, trusted proxies
and backups, follow [deployment.md](deployment.md). Cross-compilation does not
replace native operating-system acceptance or accessibility testing.

## Verify downloads

Download the archive, `checksums.txt` and its signature bundle from the same tag.
Check the selected file's SHA-256. On Unix, for example:

```sh
sha256sum --check --ignore-missing checksums.txt
```

On macOS, `shasum -a 256 <archive>` prints the selected file's digest; compare it
with `checksums.txt`. PowerShell provides `Get-FileHash <archive> -Algorithm SHA256`.
The Linux `sha256sum` example skips other platform files that were not downloaded.

Verify the checksum file's keyless signature using cosign:

```sh
cosign verify-blob checksums.txt \
  --bundle checksums.txt.sigstore.json \
  --certificate-identity 'https://github.com/AlexGalhardo/vukem-music/.github/workflows/release.yml@refs/tags/v0.1.0' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

For provenance verification with the GitHub CLI:

```sh
gh attestation verify vukem-music_0.1.0_linux_amd64.tar.gz \
  --repo AlexGalhardo/vukem-music
```

A recovery run dispatched from `main` has that workflow ref as its Sigstore
identity instead of the tag ref; inspect the run/provenance and use the actual
expected identity when verifying such a run. Do not broadly disable identity or
issuer checking to make signature verification pass.

## Maintainer publication

1. Update `package.json` and add one dated `[X.Y.Z]` section to `CHANGELOG.md` with
   `Added`, `Changed`, `Fixed` and/or `Security` notes, matching Vukem's style.
2. Validate the release config, build and relevant checks; commit/push to `main`.
   Wait for successful CI for that exact commit before creating the tag.
3. Create and push one annotated version tag. A release job checks out that tag,
   verifies its CI result and prepares the exact changelog entry as draft notes.
4. The job builds public assets, cross-compiles, archives, generates SBOMs and
   checksums, signs/verifies the checksums and uploads build provenance.
5. Only the final successful step publishes the draft. Inspect its fifteen uploaded
   assets, platform names, checksums, provenance and release notes afterward.

The workflow is [.github/workflows/release.yml](../.github/workflows/release.yml);
GoReleaser config is [.config/goreleaser.yaml](../.config/goreleaser.yaml).
`bun scripts/release-notes.ts v0.1.0` previews the exact notes without publishing.
A missing/duplicate version or a version different from `package.json` is an error.

Recover an interrupted tag run using `workflow_dispatch` with its existing version.
Do not move tags or overwrite a published release's assets. Fixes to released
source require a new version. A partially prepared draft is not a published release.
Never attach the private ElevenLabs ZIP, private source recordings, `.env`, live
SQLite files or the reference book to a release.
