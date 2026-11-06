\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New piano-solo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=26
%% Historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 20" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Piano solo study / Estudo para piano solo"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 4/4 c2. e4 | c2. e4 | d2 d | e d | c2. e4 | c2. e4 | d2 d4 e | c1 | \repeat volta 2 { d2 d | c4 e g c, | d2 d | e d | c2. e4 | c2. e4 | d2 d4 e | c1 } \bar "|." }
lower = \relative c' { \key c \major \time 4/4 e4 g e g | e g e g | f g f g | e g e g | e g e g | e g e g | f g f g | e g c, e | \repeat volta 2 { f4 g f g | e1 | f4 g f g | e g f g | e g e g | e g e g | f g f g | e g c, e } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
