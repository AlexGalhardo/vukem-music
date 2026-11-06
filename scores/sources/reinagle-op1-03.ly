\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=260
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 3" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 \repeat volta 2 { c4 c | d d | e e | g8 f e d | c4 c | d e | g8 f e d | c2 } \repeat volta 2 { e4 e | d d | f f | e e | c c | d e | g8 f e d | c2 } \bar "|." }
lower = \relative c { \key c \major \time 2/4 \repeat volta 2 { c'2 | g | c | g | c | f, | g | c } \repeat volta 2 { c2 | g | g | c | c | g | a | c } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
