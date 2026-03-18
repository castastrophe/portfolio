const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: block;
        inline-size: max-content;
        max-inline-size: calc(100% - var(--note--Padding, var(--theme--container--space)) * 2);

        box-sizing: border-box;
        background-color: var(--note--Background, var(--theme--surface--color--accent));
        border: var(--theme--BorderWidth--thin) solid var(--theme--ui--Color);
        border-inline-start: var(--theme--BorderWidth--emphasis) solid var(--theme--ui--Color);
        border-radius: var(--theme--BorderRadius);
        padding: var(--note--Padding, var(--theme--container--space));

        margin-inline-start: 0;
        margin-block-start: 0;

        *:first-child,
        ::slotted(*:first-child) {
            margin-block-start: 0;
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
