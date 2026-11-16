/* AI features need a backend that the static GitHub Pages site does not have.
   Remove every AI entry point; keep the built-in reference answers and explanations. */
(function () {
  var AI_TEXT = /(问\s*AI|问\s*GPT|让\s*AI|站内\s*AI|AI\s*正在|GPT-4\s*正在|连接\s*AI|AI\s*已连接|关闭\s*AI)/;
  var HIDE = '.api-status,.question-ai-panel,.ai-usage-note,.slide-ai,.term-ai,.ai-toast,.ai-result-backdrop,.api-modal';
  function clean(root) {
    (root.querySelectorAll ? root : document).querySelectorAll(HIDE).forEach(function (el) { el.remove(); });
    document.querySelectorAll('button, a').forEach(function (el) {
      if (AI_TEXT.test(el.textContent || '')) el.remove();
    });
    document.querySelectorAll('summary, b, span, label').forEach(function (el) {
      if (el.childElementCount === 0 && /·\s*不用问\s*AI/.test(el.textContent)) el.textContent = el.textContent.replace(/\s*·\s*不用问\s*AI/, '');
    });
  }
  var queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; clean(document); }); } }
  function start() { clean(document); new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
