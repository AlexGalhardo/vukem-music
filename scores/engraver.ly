\version "2.26.0"
#(define (vm-origin event)
 (let* ((origin (ly:input-file-line-char-column (ly:event-property event 'origin))))
  (format #f "s~a_~a" (cadr origin) (caddr origin))))
#(define (vm-moment context)
 (let ((m (ly:context-current-moment context)))
  (/ (ly:moment-main-numerator m) (ly:moment-main-denominator m))))
#(define (vm-duration event)
 (let ((m (ly:duration->moment (ly:event-property event 'duration))))
  (/ (ly:moment-main-numerator m) (ly:moment-main-denominator m))))
#(define (vm-id event context)
 (format #f "~a_t~a" (vm-origin event) (* 1000000 (vm-moment context))))
#(define vm-export
 (lambda (context)
  (make-engraver
   (listeners
    ((note-event engraver event)
     (let* ((p (ly:event-property event 'pitch))
            (port (open-file (string-append (ly:parser-output-name) ".events") "a")))
      (if (ly:pitch? p)
       (format port "~a\t~a\t~a\t~a\t~a\t~a\t~a\t~a\n"
        (vm-id event context) (vm-moment context) (vm-duration event)
        (+ 60 (ly:pitch-semitones p)) (ly:pitch-notename p)
        (+ 4 (ly:pitch-octave p)) (* 2 (ly:pitch-alteration p))
        (if (zero? (ly:moment-grace-numerator (ly:context-current-moment context))) 0 1)))
      (close port))))
   (acknowledgers
    ((note-head-interface engraver grob source)
     (let ((event (ly:grob-property grob 'cause)))
      (ly:grob-set-property! grob 'output-attributes
       `((data-source . ,(vm-id event context))))))))))
\layout {
 \context { \Voice \consists #vm-export }
}
