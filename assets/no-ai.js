/* AI features need a backend that the static GitHub Pages site does not have.
   Hide every AI entry point (never remove nodes: React still owns them). */
(function () {
  var AI_TEXT = /(问\s*AI|问\s*GPT|让\s*AI|站内\s*AI|AI\s*正在|GPT-4\s*正在|连接\s*AI|AI\s*已连接|关闭\s*AI)/;
  function clean() {
    document.querySelectorAll('button:not([data-noai]), a:not([data-noai])').forEach(function (el) {
      if (AI_TEXT.test(el.textContent || '')) el.setAttribute('data-noai', '');
    });
  }
  var queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; clean(); }); } }
  function start() { clean(); new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
