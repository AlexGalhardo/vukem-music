\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New student-primo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=21
%% Teacher secondo, historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 9" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Student primo only / Apenas o primo do aluno"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 3/4 c2. | e4 d c | d2. | g | c, | e4 d c | d2. | d4 e d | c2. | e4 d c | d2. | g | c, | e4 d c | d2 g4 | c,2. | \repeat volta 2 { d2. | g | c, | e | d | g | c, | d4 e d | c2. | e4 d c | d2. | g | c, | e4 d c | d2 g4 | c,2. } \bar "|." }
lower = \relative c' { \key c \major \time 3/4 g'4 g g | g2. | g4 g g | g g g | g g g | g2. | g4 g g | g2. | g4 g g | g2. | g4 g g | g g g | g g g | g2. | g4 g g | g g g | \repeat volta 2 { g g g | g g g | g g g | g g g | g g g | g g g | g g g | g2. | g4 g g | g2. | g4 g g | g g g | g g g | g2. | g4 g g | g2. } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
