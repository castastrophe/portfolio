const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: inline-flex;
        row-gap: var(--spacing--vertical, 1em);
        column-gap: var(--spacing--horizontal, 1em);
    }

    ::slotted(a:visited) {
        color: var(--theme--color--ui-accent);
    }

    ::slotted(a:hover) {
        color: var(--theme--color--ui-accent--hover);
    }

    ::slotted(a:focus) {
        color: var(--theme--color--ui-accent--focus);
    }

    ::slotted(a:focus-visible) {
        outline: 2px solid var(--theme--color--ui-accent--focus);
        outline-offset: var(--outline-offset);
        border-radius: var(--border-radius);
    }

    ::slotted(a:has(.fa, .fa-brands, .fa-solid)) {
        inline-size: 1.2em;
        block-size: fit-content;
        display: inline-grid;
        place-items: center;
    }
`);

customElements.define(
    "icon-group",
    class IconGroup extends HTMLElement {
        static observedAttributes = ["icons"];

        _icons = [];

        get icons() {
            return this._icons;
        }

        set icons(value) {
            this._icons = value;
        }

        constructor() {
            super();

            this.shadowRoot = this.attachShadow({ mode: "open" });
            this.setAttribute("role", "group");
            this.icons = JSON.parse(this.getAttribute("icons") || "[]") ?? this.icons;
        }

        render() {
            const icon_container = this.querySelector(".icon-container");

            if (this.icons.length === 0 || !icon_container) {
                return;
            }

            icon_container.innerHTML = "";

            this.icons.forEach(({ url, icon, label }) => {
                const link = document.createElement("a");
                link.href = url;
                link.rel = "me";
                if (label) {
                    link.ariaLabel = label;
                }
                link.innerHTML = `<span class="fa-brands fa-${icon}"></span>`;
                icon_container.appendChild(link);
            });
        }

        connectedCallback() {
            this.shadowRoot.adoptedStyleSheets = [styles];

            this.shadowRoot.innerHTML = `
                <slot></slot>
            `;

            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "icons") {
                this._icons = JSON.parse(newValue || "[]") ?? this._icons;
                this.render();
            }
        }
    },
);
