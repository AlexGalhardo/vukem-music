\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=262
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 12" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key g \major \time 2/4 <b, g'>8 <b g'> <b g'> <b g'> | <b g'>4 <d fis a> | c'8 b a g | d'2 | d8 b c e | d b g g | b a g fis | <b, g'>2 | g'8 g g g | g b d fis | fis e d c | e d c b | c c c c | c e g b | a4 g | g fis | <b, g'>8 <b g'> <b g'> <b g'> | <b g'>4 <d fis a> | c'8 b a g | d'2 | d8 b c e | d b g g | b a g fis | <b, g'>2 \bar "|." }
lower = \relative c { \key g \major \time 2/4 g'4 fis | e d | g2 | c,8 d e fis | g4 c, | g'2 | d | g4 g, | c'2 | g | b | c | g' | g, | a4 b | d,2 | g4 fis | e d | g2 | c,8 d e fis | g4 c, | g'2 | d | g4 g, \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
