\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New piano-solo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=24
%% Historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 13" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Piano solo study / Estudo para piano solo"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 4/4 c1 | g' | c, | g' | c, | g' | c,2 g' | c,1 \bar "|." }
lower = \relative c' { \key c \major \time 4/4 c4 d e f | g f e d | c d e f | g f e d | c d e f | g f e d | e g e f | c1 \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
