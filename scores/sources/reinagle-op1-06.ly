\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=261
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 6" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 4/4 \repeat volta 2 { d8 e d c b c d4 | c8 e d c b4 g | d'8 f e d c d e f | b,4 c d2 } \repeat volta 2 { d8 e d c b4 b | e8 f e d c4 c | e8 g f e d e f g | g,4 a b2 } \bar "|." }
lower = \relative c { \key c \major \time 4/4 \repeat volta 2 { c2 g' | c, g' | c, g' | f4 g c,2 } \repeat volta 2 { c2 g' | d g | c, g' | f4 g c,2 } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
