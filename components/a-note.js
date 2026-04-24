const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: block;
        inline-size: fit-content;
        max-inline-size: 100%;
        min-inline-size: 0;

        box-sizing: border-box;
        background-color: var(--note--Background, var(--theme--surface--color));
        border: var(--theme--BorderWidth) solid var(--theme--ui--color);
        border-inline-start: var(--theme--BorderWidth--emphasis) solid var(--theme--ui--color);
        border-radius: var(--theme--BorderRadius);
        padding: var(--note--Padding, var(--theme--container--space));

        overflow-wrap: anywhere;
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
        }

        connectedCallback() {
            const templateElement = document.createElement("template");
            templateElement.innerHTML = `
                <slot></slot>`;

            this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
            this.shadowRoot.adoptedStyleSheets = [styles];
        }
    },
);
