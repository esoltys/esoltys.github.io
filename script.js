/**
 * script.js — Progressive enhancement layer for esoltys.github.io
 */

(function () {
  'use strict';

  // Luminous Theme Screenshot Cycle
  function initThemeCycle() {
    var imgs = document.querySelectorAll('.theme-cycle-img');
    if (!imgs || !imgs.length) return;

    // Respect reduced motion preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % imgs.length;
      imgs.forEach(function (img, i) {
        img.style.opacity = i === idx ? '1' : '0';
      });
    }, 2600);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeCycle);
  } else {
    initThemeCycle();
  }
})();
