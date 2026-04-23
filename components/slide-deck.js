const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: block;
    position: relative;
    inline-size: 100%;
    block-size: 100dvh;
    overflow: hidden;
    background: var(--deck-bg, #0f0f1a);
    color: var(--deck-color, #e8e8f0);
    container-type: size;
    container-name: deck;
  }

  ::slotted(slide-item) {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    transform: translateX(1.5rem);
    will-change: opacity, transform;
  }

  ::slotted(slide-item[active]) {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }

  /* Overlay sits on top of slotted content */
  .overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 50;
  }

  .home {
    position: absolute;
    inset-block-start: 1.25rem;
    inset-inline-start: 1.5rem;
    pointer-events: auto;
    opacity: 0.25;
    transition: opacity 0.2s;
    text-decoration: none;
    color: inherit;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .home:hover,
  .home:focus-visible {
    opacity: 0.75;
  }

  .home:focus-visible {
    outline: 2px solid var(--deck-accent, oklch(70% 0.22 280));
    outline-offset: 4px;
    border-radius: 2px;
  }

  .controls {
    position: absolute;
    inset-block-end: 1.5rem;
    inset-inline-end: 1.5rem;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .counter {
    position: absolute;
    inset-block-end: 1.75rem;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    font-size: 0.65rem;
    font-family: ui-monospace, 'PT Mono', monospace;
    color: rgba(255, 255, 255, 0.28);
    letter-spacing: 0.12em;
    user-select: none;
    white-space: nowrap;
  }

  .progress {
    position: absolute;
    inset-block-end: 0;
    inset-inline-start: 0;
    block-size: 2px;
    background: var(--deck-accent, oklch(70% 0.22 280));
    transition: inline-size 0.3s ease;
    transform-origin: left;
  }

  button {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: inherit;
    font-size: 0.85rem;
    transition: background 0.2s;
    line-height: 1;
  }

  button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  button:focus-visible {
    outline: 2px solid var(--deck-accent, oklch(70% 0.22 280));
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.25;
    cursor: default;
  }
`);

class SlideDeck extends HTMLElement {
  #current = 0;
  #slides = [];
  #pointerStartX = 0;
  #handleKey = null;
  #handlePointerUp = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    if (this.shadowRoot.children.length > 0) return;

    const backlink = this.getAttribute('backlink') ?? '/presentations/';

    this.shadowRoot.innerHTML = `
      <slot></slot>
      <div class="overlay" aria-hidden="true">
        <a class="home" href="${backlink}">&#8592; Presentations</a>
        <div class="controls">
          <button class="prev" aria-label="Previous slide" disabled>&#8592;</button>
          <button class="next" aria-label="Next slide">&#8594;</button>
        </div>
        <div class="counter" role="status" aria-live="polite" aria-atomic="true"></div>
        <div class="progress" role="progressbar" aria-valuemin="0"></div>
      </div>
    `;

    this.shadowRoot.querySelector('.prev').addEventListener('click', () => this.prev());
    this.shadowRoot.querySelector('.next').addEventListener('click', () => this.next());

    // Defer slide discovery until children are parsed and upgraded
    requestAnimationFrame(() => {
      this.#slides = [...this.querySelectorAll(':scope > slide-item')];

      const hash = parseInt(location.hash.slice(1), 10);
      this.#goto(isNaN(hash) || hash < 1 ? 0 : hash - 1, false);
      this.#setupListeners();
    });
  }

  disconnectedCallback() {
    if (this.#handleKey) document.removeEventListener('keydown', this.#handleKey);
    if (this.#handlePointerUp) this.removeEventListener('pointerup', this.#handlePointerUp);
  }

  get total() {
    return this.#slides.length;
  }

  get currentIndex() {
    return this.#current;
  }

  #goto(index, pushHistory = true) {
    const total = this.#slides.length;
    if (total === 0) return;

    const prev = this.#current;
    this.#current = Math.max(0, Math.min(index, total - 1));

    this.#slides.forEach((slide, i) => {
      if (i === this.#current) {
        slide.setAttribute('active', '');
        slide.removeAttribute('aria-hidden');
      } else {
        slide.removeAttribute('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    if (pushHistory) {
      history.replaceState(null, '', `#${this.#current + 1}`);
    }

    this.#updateUI();

    if (prev !== this.#current) {
      this.dispatchEvent(new CustomEvent('slidechange', {
        bubbles: true,
        detail: { index: this.#current, total, slide: this.#slides[this.#current] },
      }));
    }
  }

  #updateUI() {
    const { shadowRoot } = this;
    const cur = this.#current;
    const total = this.#slides.length;

    const counter = shadowRoot.querySelector('.counter');
    if (counter) counter.textContent = `${cur + 1} / ${total}`;

    const progress = shadowRoot.querySelector('.progress');
    if (progress) {
      const pct = total > 0 ? ((cur + 1) / total) * 100 : 0;
      progress.style.inlineSize = `${pct}%`;
      progress.setAttribute('aria-valuenow', cur + 1);
      progress.setAttribute('aria-valuemax', total);
    }

    const prevBtn = shadowRoot.querySelector('.prev');
    const nextBtn = shadowRoot.querySelector('.next');
    if (prevBtn) prevBtn.disabled = cur === 0;
    if (nextBtn) nextBtn.disabled = cur === total - 1;
  }

  #setupListeners() {
    this.#handleKey = (e) => {
      // Don't hijack keys when focus is inside an interactive element
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;

      const map = {
        ArrowRight: () => this.next(),
        ArrowDown: () => this.next(),
        ' ': () => this.next(),
        ArrowLeft: () => this.prev(),
        ArrowUp: () => this.prev(),
        Home: () => this.#goto(0),
        End: () => this.#goto(this.total - 1),
        f: () => this.#toggleFullscreen(),
        F: () => this.#toggleFullscreen(),
      };

      const action = map[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    document.addEventListener('keydown', this.#handleKey);

    // Touch / pointer swipe
    this.addEventListener('pointerdown', (e) => {
      this.#pointerStartX = e.clientX;
    });

    this.#handlePointerUp = (e) => {
      const delta = e.clientX - this.#pointerStartX;
      if (Math.abs(delta) > 48) {
        delta < 0 ? this.next() : this.prev();
      }
    };
    this.addEventListener('pointerup', this.#handlePointerUp);

    // Hash navigation (back/forward browser buttons)
    window.addEventListener('hashchange', () => {
      const hash = parseInt(location.hash.slice(1), 10);
      if (!isNaN(hash) && hash >= 1) {
        this.#goto(hash - 1, false);
      }
    });
  }

  #toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      this.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    }
  }

  next() { this.#goto(this.#current + 1); }
  prev() { this.#goto(this.#current - 1); }

  /** 1-based public API — go(3) goes to slide 3 */
  go(n) { this.#goto(n - 1); }
}

customElements.define('slide-deck', SlideDeck);
