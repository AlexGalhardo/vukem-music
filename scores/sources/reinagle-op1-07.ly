\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=261
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
\header { title = "Reinagle Op.1 — No. 7" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 \repeat volta 2 { e8 f e f | g4 g | f e | d c | e8 g f e | g4 g | f e | d2 } \repeat volta 2 { d8 e d e | c4 c | g' g | f e | a f | c8 d e g | f4 d | c2 } \bar "|." }
lower = \relative c { \key c \major \time 2/4 \repeat volta 2 { c'2 | c | c | c | c | c | b4 c | g2 } \repeat volta 2 { g2 | a | d, | g | e | a | g | c } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
