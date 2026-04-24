const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
    inline-size: 100%;
    block-size: var(--demo-height, 100%);
    position: relative;
    border-radius: var(--demo-radius, 8px);
    overflow: hidden;
    background: var(--demo-bg, #fff);
  }

  .frame {
    flex: 1;
    inline-size: 100%;
    block-size: 100%;
    border: none;
    display: block;
    min-block-size: 0;
  }

  .loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.12);
    font-size: 0.75rem;
    font-family: ui-monospace, 'PT Mono', monospace;
    letter-spacing: 0.06em;
    color: rgba(0, 0, 0, 0.45);
    transition: opacity 0.3s;
  }

  .loading[hidden] {
    display: none;
  }

  /* Caption slot — styled from outside via ::part(caption) */
  ::slotted([slot="caption"]) {
    display: block;
    padding: 0.35rem 0.75rem;
    background: rgba(0, 0, 0, 0.55);
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.05em;
  }
`);

class SlideDemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  static get observedAttributes() {
    return ['src', 'label'];
  }

  connectedCallback() {
    if (this.shadowRoot.children.length > 0) return;

    const src = this.getAttribute('src') ?? '';
    const label = this.getAttribute('label') ?? 'Live demo';

    this.shadowRoot.innerHTML = `
      <div class="loading">Loading demo&hellip;</div>
      <iframe
        class="frame"
        src="${this.#processUrl(src)}"
        title="${label}"
        loading="lazy"
        allow="clipboard-write; clipboard-read"
        part="frame"
      ></iframe>
      <slot name="caption"></slot>
    `;

    const frame = this.shadowRoot.querySelector('.frame');
    const loading = this.shadowRoot.querySelector('.loading');

    frame.addEventListener('load', () => { loading.hidden = true; });
  }

  attributeChangedCallback(name, _prev, value) {
    const frame = this.shadowRoot?.querySelector('.frame');
    if (!frame) return;

    if (name === 'src') frame.src = this.#processUrl(value ?? '');
    if (name === 'label') frame.title = value ?? '';
  }

  // CodePen URLs get lightweight embed params automatically
  #processUrl(url) {
    if (!url) return '';

    try {
      const parsed = new URL(url, location.href);

      if (parsed.hostname === 'codepen.io') {
        // Convert /pen/ to /embed/ for proper embed behaviour
        const embedUrl = new URL(url);
        embedUrl.pathname = embedUrl.pathname.replace('/pen/', '/embed/');
        if (!embedUrl.searchParams.has('default-tab')) {
          embedUrl.searchParams.set('default-tab', 'result');
        }
        embedUrl.searchParams.set('theme-id', 'dark');
        return embedUrl.toString();
      }
    } catch {
      // Not a valid absolute URL — return as-is (relative paths, etc.)
    }

    return url;
  }
}

customElements.define('slide-demo', SlideDemo);
