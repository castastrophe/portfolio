const styles = new CSSStyleSheet();
styles.replaceSync(`
    @property --card--Padding {
        syntax: "<length>";
        inherits: false;
        initial-value: Clamp(.5em, .2vw, 3em);
    }

    @property --card--Width {
        syntax: "<length>";
        inherits: false;
        initial-value: 80ch;
    }

    @property --card--Display {
        syntax: "<string>";
        inherits: false;
        initial-value: flex;
    }

    @property --card--Direction {
        syntax: "<string>";
        inherits: false;
        initial-value: column;
    }

    @property --card--Wrap {
        syntax: "<string>";
        inherits: false;
        initial-value: nowrap;
    }

    @property --card--AlignItems {
        syntax: "<string>";
        inherits: false;
        initial-value: stretch;
    }

    @property --card--JustifyContent {
        syntax: "<string>";
        inherits: false;
        initial-value: start;
    }

    @property --card--Gap--horizontal {
        syntax: "<length>";
        inherits: false;
        initial-value: var(--spacing--horizontal);
    }

    @property --card--Gap--vertical {
        syntax: "<length>";
        inherits: false;
        initial-value: var(--spacing--vertical);
    }

    :host {
        --card--Padding: Clamp(.5em, .2vw, 3em);

        box-sizing: border-box;
        inline-size: min(var(--card--Width, 80ch), 100%);

        display: var(--card--Display, flex);
        flex-direction: var(--card--Direction, column);
        flex-wrap: var(--card--Wrap, nowrap);
        row-gap: var(--card--Gap--vertical, var(--spacing--vertical));
        column-gap: var(--card--Gap--horizontal, var(--spacing--horizontal));
        align-items: var(--card--AlignItems, stretch);
        justify-content: var(--card--JustifyContent, start);

        padding-block: var(--card--Padding);
        /* Note: inline padding appears on the individual slots, not the host */

        font-size: Clamp(1em, 1vw, 1.3em);
        color: var(--card--TextColor);
        background: var(--card--Background, var(--theme--surface--color));

        border: var(--card--BorderWidth, 1px) solid var(--card--BorderColor, var(--theme--surface--color));
        border-radius: var(--card--BorderRadius, 0);

        container: card / inline-size;
    }

    :host([layout="video-content"]) {
        --card--Width: calc(80ch + var(--card--video--Width));
        --card--video--Width: 400px, 100%);
        --card--Padding: 0;
    }

    @container card (width < 800px) {
        :host([layout="video-content"]) ::slotted(.video-container) {
            margin-inline: calc(var(--card--Padding) * -1);
            margin-block-start: calc(var(--card--Padding) * -1);
        }
    }

    @container card (width >= 800px) {
        :host([layout="video-content"]) slot:where(:not([name])) {
            flex-flow: row nowrap;
            column-gap: calc(var(--spacing--horizontal) * 2);

            ::slotted(.video-container) {
                inline-size: min(var(--card--video--Width), 100%);
                block-size: auto;
            }

            ::slotted(:has(> iframe)) {
                padding: 0;
            }

            ::slotted(.content) {
                flex-grow: 1;
                inline-size: calc(100% - var(--card--video--Width));
                padding: var(--card--Padding);
            }
        }
    }

    slot:where(:not([name])) {
        flex-grow: 1;
    }

    :host(:not([overflow])) slot {
        padding-inline: var(--card--Padding);
    }

    ::slotted(.title) {
        --title--LineHeight: 1.8;
        --title--Padding: 0.2em calc(var(--spacing--horizontal) * 2);
        --title--InlineSize: 100%;
    }

    ::slotted(.headline) {
        font-size: 1.4em;
        font-weight: 600;

        margin-block-end: 0;
    }

    :host([featured], [accent]) ::slotted(.headline) {
        color: var(--theme--heading--Color--accent);
    }

    :host([bordered]) {
        --card--BorderWidth: 2px;
        --card--BorderColor: var(--theme--ui--Color--subtle);
        --card--Background: var(--theme--surface--color);
    }

    :host([bordered][featured]) {
        --card--BorderColor: color-mix(in srgb, var(--theme--ui--Color) 60%, var(--theme--surface--color));
    }

    :host([overflow]) {
        --card--BorderRadius: 5px;

        overflow: hidden;
        padding-block: 0;

        slot:where([name="header"]) {
            padding-inline: 0;
        }

        slot:where([name="footer"], :not([name])) {
            padding-inline: var(--card--Padding);
        }
    }

    :host([overflow]:has([name="footer"])) [slot="footer"] {
        padding-block-end: var(--card--Padding);
    }

    :host([overflow]:not(:has([name="footer"]))) .body {
        padding-block-end: var(--card--Padding);
    }

    :host([overflow]:not([bordered])) {
        gap: 0;

        ::slotted(:not(:has(iframe))) {
            padding-inline: var(--card--Padding);
        }

        ::slotted(.title) {
            position: relative;
            padding: .5em var(--card--Padding) 0.2em;
            margin-inline: calc(var(--spacing--horizontal) * -1);
        }
    }

    @media print {
        :host(:not([featured])) {
            border: none;
        }

        ::slotted(.title::after) {
            display: none;
        }
    }
`);

customElements.define(
    "a-card",
    class ACard extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" });
        }

        connectedCallback() {
            const templateElement = document.createElement("template");
            templateElement.innerHTML = `
                <slot name="header"></slot>
                <slot></slot>
                <slot name="footer"></slot>`;

            this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
            this.shadowRoot.adoptedStyleSheets = [styles];
        }
    },
);
