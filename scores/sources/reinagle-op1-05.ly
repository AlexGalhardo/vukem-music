\version "2.26.0"
\include "export.ly"
%% Alexander Reinagle, Op.1. Historical music Public Domain.
%% New study transcription © 2026 AlexGalhardo; MIT.
%% Source: https://archive.org/download/hartley00535538/hartley00535538.pdf#page=261
%% DRAFT: independent note-by-note source comparison remains pending.
%% Historical fingerings, ornaments and phrase slurs are omitted.
%% No.5 bar12 bass rest is editorial: scan reading unresolved.
\header { title = "Reinagle Op.1 — No. 5" composer = "Alexander Reinagle (1756–1809)"
 subtitle = "Study transcription — source review pending / Conferência pendente"
 copyright = "Study engraving © 2026 AlexGalhardo · MIT; original music Public Domain" }
upper = \relative c'' { \key c \major \time 2/4 \repeat volta 2 { g'8 e c c | c c c c | d e f g | f e d c | g' e c c | c c c c | d e f e | e4 d } \repeat volta 2 { d8 b g g | c b a g | d' b g g | g' f e d | g e c c | d e g f | a g f e | d2 } \bar "|." }
lower = \relative c { \key c \major \time 2/4 \repeat volta 2 { c'2 | c | g | c | c | c | b4 c | g2 } \repeat volta 2 { g2 | g | g | R2 | c | g | a | c } \bar "|." }
\score { \unfoldRepeats \new PianoStaff << \new Staff { \clef treble \upper } \new Staff { \clef bass \lower } >> \layout {} \midi {} }
