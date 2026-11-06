\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=260
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 1" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 3/4 \repeat volta 2 { c4 c c | d d d | e e e | e f g | c, c c | d d d | e4 g8 f e d | c2. } \repeat volta 2 { e4 e e | d d d | c c c | g'2. | f | e4 d c | e4 g8 f e d | c2. } \bar "|." }
lower = \relative c { \key c \major \time 3/4 \repeat volta 2 { c'2. | g | c | c | c | g | c | c } \repeat volta 2 { c2. | b | a | c | g4 a b | c2. | c | c } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
