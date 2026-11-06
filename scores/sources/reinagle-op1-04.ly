\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=260
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 4" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 \repeat volta 2 { c4 d | f8 e d c | d4 e | f2 | e4 g | c,8 d e f | e4 d | c2 } g'4 f | f8 e d c | g'4 f | f8 e d c | g'4 f | f8 e d c | g'4 f | f e | c4 d | f8 e d c | d4 e | f2 | e4 g | c,8 d e f | e4 d | c2 \bar "|." }
lower = \relative c { \key c \major \time 2/4 \repeat volta 2 { c'2 | c | b | b | c | g | a | c } b2 | c | b | c | b | c | d4 e | b2 | c | c | b | b | c | g | a | c \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
