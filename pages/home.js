// Initialize scroll-based animations and gallery functionality
document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery');

  // Gallery horizontal scroll functionality
  if (gallery) {
    let isScrolling;

    gallery.addEventListener('wheel', (e) => {
      clearTimeout(isScrolling);

      isScrolling = setTimeout(() => {
        if (e.deltaY !== 0) {
          // e.deltaY > 0 => scrolling down
          // e.deltaY < 0 => scrolling up
          gallery.scrollLeft += e.deltaY;
        }
      }, 6); // debouncing
    });
  }

  // SVG scroll animation fallback for browsers without CSS scroll-driven animations support
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    const svgElements = {
      circlePulse: document.querySelectorAll('.circle-pulse'),
      circleRotate: document.querySelectorAll('.circle-rotate'),
      pathDraw: document.querySelectorAll('.path-draw'),
      textFade: document.querySelectorAll('.text-fade')
    };

    let ticking = false;

    /**
     * Handle scroll-based SVG animations for browsers without native support
     */
    function updateSVGAnimations() {
      const scrollProgress = Math.min(window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight), 1);

      // Animate pulsing circles
      svgElements.circlePulse.forEach((element, index) => {
        const phase = (scrollProgress * Math.PI * 2) + (index * 0.5);
        const scale = 1 + Math.sin(phase) * 0.1;
        const opacity = 0.3 + Math.sin(phase) * 0.2;
        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity;
      });

      // Animate rotating circles
      svgElements.circleRotate.forEach((element, index) => {
        const rotation = scrollProgress * 360 + (index * 45);
        element.style.transform = `rotate(${rotation}deg)`;
        element.style.transformOrigin = 'center';
      });

      // Animate path drawing
      svgElements.pathDraw.forEach((element, index) => {
        const drawProgress = Math.min(scrollProgress * 1.4, 1); // Complete by 70% scroll
        const pathLength = element.getTotalLength ? element.getTotalLength() : 1000;
        const offset = pathLength * (1 - drawProgress);
        element.style.strokeDasharray = pathLength;
        element.style.strokeDashoffset = offset;
        element.style.opacity = 0.3 + drawProgress * 0.7;
      });

      // Animate text fade
      svgElements.textFade.forEach((element, index) => {
        const fadeStart = 0.2;
        const fadeEnd = 0.8;
        const fadeProgress = Math.max(0, Math.min(1, (scrollProgress - fadeStart) / (fadeEnd - fadeStart)));
        const opacity = fadeProgress * 0.7;
        const translateY = (1 - fadeProgress) * 10 - fadeProgress * 5;
        element.style.opacity = opacity;
        element.style.transform = `translateY(${translateY}px)`;
      });

      ticking = false;
    }

    /**
     * Throttle scroll events using requestAnimationFrame
     */
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateSVGAnimations);
        ticking = true;
      }
    }

    // Add scroll listener for fallback animations
    window.addEventListener('scroll', requestTick, { passive: true });

    // Initialize animations
    updateSVGAnimations();
  }

  const detailEl = document.querySelector('.post-toc');
  if (detailEl) {
    const summaryEl = detailEl.querySelector('summary');
    summaryEl.addEventListener("click", () => {
      // toggle the detail container on click
      detailEl.toggleAttribute("open", detailEl.hasAttribute("open"));
    });

    detailEl.querySelectorAll('a').forEach(link => {
      link.addEventListener("click", () => {
        // close the detail container on click after a short delay
        setTimeout(() => {
          detailEl.toggleAttribute("open", detailEl.hasAttribute("open"));
        }, 100);
      });
    });

    // close the detail container on click outside of the detail container or the summary
    document.addEventListener("click", (evt) => {
      if (detailEl.hasAttribute("open") && (evt.target !== detailEl && evt.target !== summaryEl)) {
        detailEl.toggleAttribute("open", false);
      }
    }, { capture: true });
  }
});
