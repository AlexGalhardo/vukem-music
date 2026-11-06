\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New piano-solo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=24
%% Historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 15" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Piano solo study / Estudo para piano solo"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 4/4 c4 d e f | g f e d | c d e f | e2 d | c4 d e f | g f e d | c d e f | e d c2 | \repeat volta 2 { d4 e f e | d1 | e4 f g f | e2. d4 | c d e f | g f e d | c d e f | e d c2 } \bar "|." }
lower = \relative c' { \key c \major \time 4/4 c1 | g' | c, | g'4 g g g | c,1 | g' | c,2. f4 | g2 c, | \repeat volta 2 { g'1 | g4 f e d | c1 | c4 g' e g | c,1 | g' | c,2. f4 | g2 c, } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
