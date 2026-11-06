\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=260
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 2" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 3/4 \repeat volta 2 { g'4 g g | e c c | d d d | e4 c8 d e f | g4 g g | e c c | d d d | e2. } \repeat volta 2 { e4 e e | d d d | f f f | e4 c8 d e f | g4 g g | e c c | d4 d8 e d e | c2. } \bar "|." }
lower = \relative c { \key c \major \time 3/4 \repeat volta 2 { c'2. | c | g | c | c | c | g | c } \repeat volta 2 { c2. | g | g | c | c | c | g | c } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
