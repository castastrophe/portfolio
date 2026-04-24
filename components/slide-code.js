// No shadow DOM — Prism's global styles need direct access to .token elements.
// The component processes its own text content into a highlighted pre/code block.

class SlideCode extends HTMLElement {
  #initialized = false;
  #liveStyle = null;

  static get observedAttributes() {
    return ['lang', 'editable'];
  }

  connectedCallback() {
    if (this.#initialized) return;
    this.#initialized = true;
    this.#render();
  }

  disconnectedCallback() {
    if (this.#liveStyle) {
      this.#liveStyle.remove();
      this.#liveStyle = null;
    }
  }

  #render() {
    const lang = this.getAttribute('lang') || 'text';
    const editable = this.hasAttribute('editable');
    const raw = this.#extractCode();

    this.innerHTML = '';

    const pre = document.createElement('pre');
    pre.className = `language-${lang} line-numbers`;

    const code = document.createElement('code');
    code.className = `language-${lang}`;
    code.textContent = raw;

    pre.appendChild(code);
    this.appendChild(pre);

    this.#highlight(code);

    if (editable) {
      this.#makeEditable(code, lang);
    }
  }

  #highlight(codeEl) {
    if (window.Prism) {
      Prism.highlightElement(codeEl);
    } else {
      // Prism loads async — wait for it
      window.addEventListener('load', () => {
        if (window.Prism) Prism.highlightElement(codeEl);
      }, { once: true });
    }
  }

  // Strip the shared leading indentation authored in the template
  #extractCode() {
    const raw = this.textContent;
    const lines = raw.split('\n');

    const minIndent = lines
      .filter(l => l.trim().length > 0)
      .reduce((min, line) => {
        const indent = line.match(/^(\s*)/)[1].length;
        return Math.min(min, indent);
      }, Infinity);

    const indent = isFinite(minIndent) ? minIndent : 0;

    return lines
      .map(l => l.slice(indent))
      .join('\n')
      .trim();
  }

  #makeEditable(codeEl, lang) {
    // plaintext-only keeps paste clean and prevents HTML injection
    codeEl.setAttribute('contenteditable', 'plaintext-only');
    codeEl.setAttribute('spellcheck', 'false');
    codeEl.setAttribute('autocorrect', 'off');
    codeEl.setAttribute('autocapitalize', 'off');
    codeEl.setAttribute('data-editable', '');

    if (lang === 'css') {
      this.#liveStyle = document.createElement('style');
      this.#liveStyle.dataset.slideCode = '';
      document.head.appendChild(this.#liveStyle);

      // Seed the live style with the initial code
      this.#liveStyle.textContent = codeEl.textContent;

      codeEl.addEventListener('input', () => {
        this.#liveStyle.textContent = codeEl.textContent;
      });
    }

    if (lang === 'js') {
      codeEl.addEventListener('keydown', (e) => {
        // Run on Cmd/Ctrl+Enter
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          try {
            // eslint-disable-next-line no-new-func
            new Function(codeEl.textContent)();
          } catch (err) {
            console.error('[slide-code]', err);
          }
        }
      });
    }
  }
}

customElements.define('slide-code', SlideCode);
