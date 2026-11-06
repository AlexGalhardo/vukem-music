\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=262
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 11" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key g \major \time 4/4 \repeat volta 2 { g4 g a a | c8 b a g d'2 | d8 c b a c b a g | b a g fis g2 } \repeat volta 2 { g'4 fis e d | c8 d e c b2 | b8 a g fis b a g fis | a g fis e g2 } \bar "|." }
lower = \relative c { \key g \major \time 4/4 \repeat volta 2 { g'2 fis | g fis4 d | e g a2 | d, a' } \repeat volta 2 { e4 g d g | c, g' b, g' | e fis g2 | d g } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
