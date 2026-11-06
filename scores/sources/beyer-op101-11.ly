\version "2.26.0"
\include "export.ly"
%% Original composition: Ferdinand Beyer, Op.101. Public Domain.
%% New student-primo transcription: Copyright 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/imslp-im-klavierspiel-op101-beyer-ferdinand/PMLP31149-F_Beyer-Op101.pdf#page=23
%% Teacher secondo, historical fingerings and phrase slurs are not included.
\header { title = "Beyer Op.101 — No. 11" composer = "Ferdinand Beyer (1803–1863)"
 subtitle = "Student primo only / Apenas o primo do aluno"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 3/4 d2 b4 | d2 b4 | a4 g a | g2. | a4 a b | c2 a4 | b4 b c | d2 b4 | d2 b4 | d2 b4 | d2 b4 | a4 g a | g2. r4 g' g | r g g | r d d | r d( g) | r d d | r d d | r g g | r g g | r g g | r g g | r g g | r g g | r d d | r d( g) \bar "|." }
lower = \relative c' { \key c \major \time 3/4 r4 g'2 | r4 g2 | r4 d2 | R2. | r4 d d | r d d | r d d | r g2 | r4 g2 | r4 g2 | r4 g2 | r4 d2 | R2. | d'2 b4 | d2 b4 | a4 g a | g2. | a4 a b | c2 a4 | b4 b c | d2 b4 | d2 b4 | d2 b4 | d2 b4 | a4 g a | g2. \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef treble \lower } >> \layout {} \midi {} }
