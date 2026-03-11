const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: block;
        inline-size: max-content;
        max-inline-size: calc(100% - var(--note--Padding, var(--theme--container--space)) * 2);

        box-sizing: border-box;
        background-color: color-mix(in sRGB, var(--theme--ui--Color) 10%, var(--note-background-base, var(--theme--surface--color)));
        border: 1px solid var(--theme--ui--Color);
        border-inline-start: 8px solid var(--theme--ui--Color);
        border-radius: var(--border-radius);
        padding: var(--note--Padding, var(--theme--container--space));

        font-size: 1em;
        font-weight: var(--theme--FontWeight);

        margin-inline-start: 0;
        inline-size: 100%;

        ::slotted(strong) {
            font-weight: var(--theme--FontWeight--extra-bold);
        }
    }

    ::slotted(p + a),
    ::slotted(a:last-child) {
        display: inline-block;
        background-color: var(--theme--ui--Color);
        color: var(--theme--surface--color);
        padding: 0.5em 1em;
        border-radius: var(--border-radius);
        text-decoration: none;
        font-weight: var(--theme--FontWeight--extra-bold);
        font-size: .8em;
        line-height: var(--theme--text--LineHeight);
        margin: 0;
        border: none;
        cursor: pointer;

        &:hover {
            background-color: var(--theme--ui--Color--hover);
        }

        &:focus {
            background-color: var(--theme--ui--Color--active);
        }

        &:focus-visible {
            outline: 2px solid var(--theme--ui--Color--active);
            outline-offset: var(--outline-offset, 2px);
            border-radius: var(--border-radius);
        }

        &:active {
            background-color: var(--theme--ui--Color--active);
        }
    }
`);

customElements.define(
    "a-note",
    class ANote extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this.setAttribute("role", "note");
        }

        connectedCallback() {
            const templateElement = document.createElement("template");
            templateElement.innerHTML = `
                <slot>
                    <p>Available for full-time, consulting, speaking, writing, or workshops.</p>
                    <a href="https://fantastical.app/cassondra/inquiries">Book a free call</a>
                </slot>`;

            this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
            this.shadowRoot.adoptedStyleSheets = [styles];
        }
    },
);
