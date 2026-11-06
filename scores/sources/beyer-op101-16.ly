\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New piano-solo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=25
%% Historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 16" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Piano solo study / Estudo para piano solo"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 c4 e | d f | e c | d2 | c4 e | d f | e d | c2 | \repeat volta 2 { d4 e | c g' | f e | d2 | c4 e | d g | f e | d2 } \bar "|." }
lower = \relative c' { \key c \major \time 2/4 c2 | g' | c, | g'4 f | e c | f d | g2 | c,4 e | \repeat volta 2 { f4 g | e2 | d4 c | g' f | e c | f d | g2 | c, } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
