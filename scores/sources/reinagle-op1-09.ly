\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=262
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 9" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 \repeat volta 2 { c4 b | a g | a8 c b d | c g g g | c4 b | a g | a8 c b d | c2 } \repeat volta 2 { g4 c | a8 f f f | a4 d | b8 g g g | c4 b | a g | a8 c b d | c2 } \bar "|." }
lower = \relative c { \key c \major \time 2/4 \repeat volta 2 { d4 f | e d | e f | c2 | d4 f | e d | e f | c2 } \repeat volta 2 { c2 | f | d | g | d4 f | e d | e f | c2 } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
