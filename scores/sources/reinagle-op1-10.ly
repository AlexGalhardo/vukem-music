\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=262
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 10" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c' { \key c \major \time 3/4 \repeat volta 2 { c4 c8 d e f | g4 g g | a c b | b8 a g a f4 | b b b | c c c | d4 e8 d c b | c2. } \repeat volta 2 { e4 c8 d e f | g4 g, g | c4 e8 d c b | d8 c b c a4 | b b c | d d d | e8 f g e d c | d2. } \bar "|." }
lower = \relative c { \key c \major \time 3/4 \repeat volta 2 { c2. | e | f | g | d8 b' d, b' d, b' | e, c' e, c' e, c' | g2. | c4 g c, } \repeat volta 2 { c'2. | b | a | g | f8 c' f, c' f, c' | e, c' e, c' e, c' | g4 a2 | c4 g c, } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
