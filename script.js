// Code Meets Canvas — Eric Soltys
// Minimal interactive enhancements

document.addEventListener('DOMContentLoaded', () => {
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

  console.log('Eric Soltys #OpenToWork #RemoteOnly');
});
