// Code Meets Canvas — Eric Soltys
// Minimal interactive enhancements

document.addEventListener('DOMContentLoaded', () => {
  // --- WATER BACKGROUND CANVAS ---
  initWaterBackground();

  // --- SCROLL REVEAL ANIMATION ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, no need to observe anymore
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15, // Reveal when 15% visible
    rootMargin: '0px 0px -50px 0px' // Slightly before it hits the bottom
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Add scroll-triggered parallax on album cards
  const albumTiles = document.querySelectorAll('.album-tile');

  if (albumTiles.length > 0 && window.matchMedia('(min-width: 769px)').matches) {
    let ticking = false;

    function updateParallax() {
      const scrolled = window.pageYOffset;

      albumTiles.forEach((tile, index) => {
        const rect = tile.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const distance = (elementCenter - viewportCenter) / viewportCenter;

        // Subtle rotation and translation based on scroll position
        const rotation = distance * 1.5;
        const translateY = distance * -5;

        // Only apply when element is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          tile.style.transform = `translateY(${translateY}px) rotate(${rotation}deg)`;
        }
      });

      ticking = false;
    }

    function requestParallax() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestParallax);
  }

  // Cursor trail effect on album artwork (desktop only)
  const artworks = document.querySelectorAll('.album-artwork');

  if (artworks.length > 0 && window.matchMedia('(min-width: 769px)').matches) {
    artworks.forEach(artwork => {
      artwork.addEventListener('mousemove', (e) => {
        const rect = artwork.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;

        const img = artwork.querySelector('img');
        if (img) {
          img.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
        }
      });

      artwork.addEventListener('mouseleave', () => {
        const img = artwork.querySelector('img');
        if (img) {
          img.style.transform = '';
        }
      });
    });
  }

  // Smooth scroll for any future anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  console.log(
    "%c ERIC JAMES SOLTYS %c Senior Software Developer %c Art + Science ",
    "background: #4dd4d4; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;",
    "background: #eee; color: #000; font-weight: bold; padding: 4px 8px;",
    "background: #2a2a2a; color: #fff; padding: 4px 8px; border-radius: 0 4px 4px 0;"
  );
  console.log("%c Currently #OpenToWork for Remote-Only Senior Roles", "color: #4dd4d4; font-family: monospace; font-weight: bold; font-size: 1.1em;");
});

// =============================================================================
// WATER BACKGROUND CANVAS
// Organic, slowly-drifting water-current blobs drawn via layered sin/cos.
// No external dependencies. Skipped when prefers-reduced-motion is set.
// =============================================================================

function initWaterBackground() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function getBgColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-dark').trim() || '#0a0a0a';
  }
  function getAccentColor() {
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? '#0a9a9a'
      : '#4dd4d4';
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Three independently moving water-current blobs.
  // Each dimension is driven by two sin/cos oscillators at different
  // frequencies and phase offsets — approximating organic fluid motion.
  const blobs = [
    {
      // Primary slow wide current
      x: (t) => canvas.width  * (0.30 + 0.22 * Math.sin(t * 0.00038 + 1.1)
                                       + 0.10 * Math.cos(t * 0.00019 + 0.4)),
      y: (t) => canvas.height * (0.40 + 0.18 * Math.cos(t * 0.00031 + 2.3)
                                       + 0.08 * Math.sin(t * 0.00054 + 1.7)),
      r: (t) => canvas.width  * (0.38 + 0.08 * Math.sin(t * 0.00027 + 0.9)),
      opacity: 0.13,
    },
    {
      // Cross current
      x: (t) => canvas.width  * (0.70 + 0.20 * Math.cos(t * 0.00042 + 2.7)
                                       + 0.09 * Math.sin(t * 0.00023 + 1.2)),
      y: (t) => canvas.height * (0.60 + 0.20 * Math.sin(t * 0.00035 + 0.6)
                                       + 0.09 * Math.cos(t * 0.00048 + 3.1)),
      r: (t) => canvas.width  * (0.30 + 0.07 * Math.cos(t * 0.00033 + 2.1)),
      opacity: 0.10,
    },
    {
      // Surface ripple / small eddy
      x: (t) => canvas.width  * (0.50 + 0.28 * Math.sin(t * 0.00051 + 3.9)
                                       + 0.11 * Math.cos(t * 0.00029 + 0.8)),
      y: (t) => canvas.height * (0.25 + 0.22 * Math.cos(t * 0.00044 + 1.5)
                                       + 0.10 * Math.sin(t * 0.00037 + 2.6)),
      r: (t) => canvas.width  * (0.25 + 0.06 * Math.sin(t * 0.00041 + 1.3)),
      opacity: 0.08,
    },
  ];

  function draw(timestamp) {
    const w = canvas.width;
    const h = canvas.height;

    // Always fill solid background first — cards/text sit above on z-index:1
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, w, h);

    const [ar, ag, ab] = hexToRgb(getAccentColor());

    blobs.forEach(blob => {
      const cx = blob.x(timestamp);
      const cy = blob.y(timestamp);
      const r  = blob.r(timestamp);
      const op = blob.opacity;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   `rgba(${ar},${ag},${ab},${op})`);
      grad.addColorStop(0.5, `rgba(${ar},${ag},${ab},${(op * 0.4).toFixed(3)})`);
      grad.addColorStop(1,   `rgba(${ar},${ag},${ab},0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// Parse a #rrggbb hex string to [r, g, b]
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
