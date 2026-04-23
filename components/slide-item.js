const styles = new CSSStyleSheet();
styles.replaceSync(`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inline-size: 100%;
    block-size: 100%;
    padding-block: var(--slide-padding-block, 4rem);
    padding-inline: var(--slide-padding-inline, 6rem);
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }

  /* Two-column split layout */
  :host([layout="split"]) {
    display: grid;
    grid-template-columns: var(--slide-split-columns, 1fr 1fr);
    align-items: center;
    gap: var(--slide-gap, 3rem);
  }

  /* Full-bleed cover — no padding, content controls its own spacing */
  :host([layout="cover"]) {
    padding: 0;
  }

  /* Content aligned to the top */
  :host([layout="top"]) {
    justify-content: flex-start;
  }

  /* Content aligned to the bottom */
  :host([layout="bottom"]) {
    justify-content: flex-end;
  }

  /* Stack layout — same as default but explicit name for authored clarity */
  :host([layout="stack"]) {
    align-items: flex-start;
  }

  /* The default slot renders as flex/grid item within the host */
  slot {
    display: contents;
  }

  /* Speaker notes are hidden during presentation; a future speaker-view
     mode can reveal them by toggling this slot's display */
  slot[name="notes"] {
    display: none;
  }
`);

class SlideItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    if (this.shadowRoot.children.length > 0) return;

    this.shadowRoot.innerHTML = `
      <slot></slot>
      <slot name="notes"></slot>
    `;

    // Ensure non-active slides are hidden from AT by default
    if (!this.hasAttribute('active')) {
      this.setAttribute('aria-hidden', 'true');
    }
  }
}

customElements.define('slide-item', SlideItem);
