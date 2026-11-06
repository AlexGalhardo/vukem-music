# Third-party notices

## shadcn/ui

Components under `resources/js/components/ui` and the associated mobile hook were
generated using the [shadcn/ui registry](https://ui.shadcn.com).
Their source license is reproduced below; our application license does not remove
this attribution. Source: [shadcn/ui license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

```text
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Framework and packages

The application is generated from [Vukem](https://github.com/AlexGalhardo/vukem).
Go and Bun package dependencies retain the licenses distributed by their authors.
The lockfiles record exact resolved dependencies; the production build embeds the
frontend bundles and links the Go dependencies.

## Educational reference and audio

The reference book is cited in [study-reference.md](docs/study-reference.md) and is
not included or relicensed. Our educational prose and exercises are original.
The public sample manifest remains empty; no generated recordings are shipped
in Git. A private 88-key ElevenLabs-derived bank exists outside the repository.
ElevenCreative Exhibit 4 §2 restricts isolated samples/sound libraries; these
recordings are not MIT. See [audio.md](docs/audio.md) before distribution.
Record provenance and distribution terms before adding generated sample assets,
as described in [audio.md](docs/audio.md).

## Classical score editions

The score library links to external historical scans and Mutopia editions.
The project MIT license applies to our code and original teaching material;
it does not replace edition-specific licenses. PDFs are not tracked in Git.
`resources/js/data/repertoire.json` preserves the source, editor, license and
SHA-256 for each selected work. See the [research catalog](docs/repertoire-50.md).

Diabelli editions credit Alberto Simões under
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
Schumann editions credit Philippe Hézaine under that license or
[CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/) as stated per work.
Other selected Mutopia editions are labeled Public Domain and retain their
contributor credit. Historical Reinagle/Beyer source scans are identified in the
manifest. Downloaded copies and page excerpts must retain these credits and links.

## OpenSheetMusicDisplay

Version2.2.1 is used for browser engraving under BSD-3-Clause.

```text
Copyright 2019 PhonicScore

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## saxes

Version6.0.0 is distributed under the ISC license by Louis-Dominique Dubeau.
Its dependency notices remain in the installed distribution.

## Curated LilyPond sources

The repository also distributes the source editions identified in
`scores/manifest.json`. Their notices are retained inside the source files.
Modified Diabelli/Schumann editions remain CC BY-SA under the version recorded
per file, with contributor credit; these sources and generated SVG editions are
not relicensed MIT. The new Beyer/Reinagle transcriptions and our build/engraving code are
MIT; the historical music is public domain. Normalization, unfolded repeats and
editorial omissions are documented in [score-build.md](docs/score-build.md).
