\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New student-primo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=19
%% Teacher secondo, historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 5" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Student primo only / Apenas o primo do aluno"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 4/4 \repeat volta 2 { c2. d4 | e2. f4 | g2. f4 | e2. d4 | } c2. e4 | g2. e4 | c2 g' | c,2. r4 \bar "|." }
lower = \relative c' { \key c \major \time 4/4 \repeat volta 2 { c2. d4 | e2. f4 | g2. f4 | e2. d4 | } c2. e4 | g2. e4 | c2 g' | c,2. r4 \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
