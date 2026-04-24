const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: block;
        inline-size: min(fit-content, 100%);

        box-sizing: border-box;
        background-color: var(--note--Background, var(--theme--surface--color));
        border: var(--theme--BorderWidth) solid var(--theme--ui--color);
        border-inline-start: var(--theme--BorderWidth--emphasis) solid var(--theme--ui--color);
        border-radius: var(--theme--BorderRadius);
        padding: var(--note--Padding, var(--theme--container--space));
    }

    ::slotted(*:not(:last-child)) {
        margin-block-end: .2em !important;
    }
`);

customElements.define(
    "a-note",
    class ANote extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this.setAttribute("role", "note");
            this.shadowRoot.adoptedStyleSheets = [styles];
            this.shadowRoot.appendChild(document.createElement("slot"));
        }
    },
);
