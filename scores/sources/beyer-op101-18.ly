\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New piano-solo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=25
%% Historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 18" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Piano solo study / Estudo para piano solo"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 3/4 c4 d e | e d c | d e d | c g' g | c, d e | e d c | d e d | c2. | \repeat volta 2 { d4 e d | c g' g | d e d | c g' g | c, d e | e d c | d e d | c2. } \bar "|." }
lower = \relative c' { \key c \major \time 3/4 <e g>2. | <e g> | <f g> | <e g> | <e g> | <e g> | <f g> | e4 g c, | \repeat volta 2 { <f g>2. | <e g> | <f g> | <e g> | R2. | g4 f e | f g f | e g c, } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
