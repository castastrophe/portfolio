window.cursorSquishEnabled = false;

/**
 * Add a subtle highlight effect to the page when the mouse moves
 * over a certain region of the page.
 *
 * @param {MouseEvent} evt - The mouse move event.
 * @returns {void}
 */
document.body.addEventListener("mousemove", evt => {
  /**
   * For each highlight element, calculate the position of the mouse
   * and animate the highlight to the mouse position.
   */
  document.querySelectorAll(".highlight").forEach(element => {
    // Capture the container for this highlight element
    const parent = element.closest(".highlight-container");
    // If there's no parent, we want to position the highlight
    // relative to the body of the page, otherwise, we are
    // calculating the position relative to the container.

    const rect = parent?.getBoundingClientRect();
    const radius = element.offsetWidth / 2;

    // From the position of the mouse, calculate the position of the highlight
    // relative to the container.
    // We subtract the radius of the highlight from the mouse position to center
    // the highlight on the mouse cursor.
    // We also subtract the left and top offsets of the container to position
    // the highlight relative to the container.
    // If there is no container, we default to 0.

    const x = evt.clientX - radius - rect?.left ?? 0;
    const y = evt.clientY - radius - rect?.top ?? 0;

    // Animate the highlight to the mouse position.
    // We use the fill: "forwards" option to keep the highlight in the
    // same position after the animation completes.
    element.animate({
      left: `${x}px`,
      top: `${y}px`,
    }, {
      duration: 100,
      fill: "forwards"
    });

    const overLink = !!evt.target?.closest("a");
    let invertSquish = false;
    if (!window.cursorSquishEnabled && overLink) {
      element.animate({
        transform: `scale(2)`,
      }, {
        duration: 50,
        fill: "forwards"
      });
      invertSquish = true;
    } else if (!!window.cursorSquishEnabled && !overLink) {
      element.animate({
        transform: `scale(1)`,
      }, {
        duration: 50,
        fill: "forwards"
      });
      invertSquish = true;
    }

    if (invertSquish) window.cursorSquishEnabled = !window.cursorSquishEnabled;
  });

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
  });
});