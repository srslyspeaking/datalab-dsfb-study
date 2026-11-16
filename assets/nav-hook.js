/* The "题库" (question bank) entry opens the new practice page. */
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('nav button, .rail button');
    if (b && /题库/.test(b.textContent || '')) { e.preventDefault(); e.stopPropagation(); location.href = './practice.html'; }
  }, true);
})();
