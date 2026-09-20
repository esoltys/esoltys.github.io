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

  // Reveal Animations on Scroll
  function initRevealObserver() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals || !reveals.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback for older browsers
      reveals.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThemeCycle();
      initRevealObserver();
    });
  } else {
    initThemeCycle();
    initRevealObserver();
  }
})();
