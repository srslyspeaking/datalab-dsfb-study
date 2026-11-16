/* Expand / collapse bars on the lesson page (see lesson.css). */
(function () {
  var SEL = '.slide-teaching-visual,.slide-teaching-application,.slide-teaching-assessment,.slide-teaching-connection,.slide-plain-en,.slide-focus,.lesson-story,.lesson-steps,.lesson-terms,.lesson-visuals,.lesson-exam';
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches(SEL)) return;      /* only the bar itself (pseudo-elements hit the block) */
    if (t.hasAttribute('data-open')) {
      var r = t.getBoundingClientRect();
      if (e.clientY - r.top > 46) return;                 /* clicks in open content do not collapse it */
      t.removeAttribute('data-open');
    } else {
      t.setAttribute('data-open', '');
    }
  });
})();
