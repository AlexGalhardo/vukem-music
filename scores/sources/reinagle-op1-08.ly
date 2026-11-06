\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=261
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 8" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 \repeat volta 2 { c4 d16 c b a | g8 g g g | a4 b | c d | c d16 c b a | g8 g g g | a4 b | c2 } \repeat volta 2 { e4 f16 e d c | d8 d d e | f4 g16 f e d | e8 e e g | c,4 d16 c b a | g8 g g g | a4 b | c2 } \bar "|." }
lower = \relative c { \key c \major \time 2/4 \repeat volta 2 { <c' e>4 <c f> | <c e>2 | g4 a | b c | <c e> <c f> | <c e>2 | g4 a | c2 } \repeat volta 2 { c2 | g | b4 c | c2 | <c e>4 <c f> | <c e>2 | g4 a | c2 } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
