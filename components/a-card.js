const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        --card--Padding: Clamp(.5em, .2vw, 3em);

        box-sizing: border-box;
        display: flex;
        flex-flow: column nowrap;
        column-gap: var(--spacing--horizontal);
        row-gap: var(--spacing--vertical);

        justify-content: start;

        font-size: Clamp(1em, 1vw, 1.3em);
        inline-size: min(var(--card--MaxInlineSize, 80ch), 100%);
        color: var(--card--TextColor);
        padding-block: var(--card--Padding);
        background: var(--card--BackgroundColor, var(--theme--color--surface));
        border: var(--card--BorderWidth, 1px) solid var(--card--BorderColor, var(--theme--color--surface));
        border-radius: var(--card--BorderRadius, 0);

        container: card / inline-size;
    }

    :host([layout="video-content"]) {
        --card--MaxInlineSize: calc(80ch + var(--card-video-inline-size));
        --card-video-inline-size: min(400px, 100%);

        padding: 0;
    }

    @container card (width < 800px) {
        :host([layout="video-content"]) .video-container {
            margin-inline: calc(var(--card--Padding) * -1);
            margin-block-start: calc(var(--card--Padding) * -1);
        }
    }

    @container card (width >= 800px) {
        :host([layout="video-content"]) .body {
            flex-flow: row nowrap;
            column-gap: calc(var(--spacing--horizontal) * 2);

            ::slotted(.video-container) {
                inline-size: min(var(--card-video-inline-size), 100%);
                block-size: auto;
            }

            ::slotted(:has(> iframe)) {
                padding: 0;
            }

            ::slotted(.content) {
                flex-grow: 1;
                inline-size: calc(100% - var(--card-video-inline-size));
                padding: var(--card--Padding);
            }
        }
    }

    .body {
        flex-grow: 1;
        display: flex;
        flex-flow: column nowrap;
        row-gap: var(--spacing--vertical);
        column-gap: var(--spacing--horizontal);
    }

    :host(:not([overflow])) {
        [slot="header"],
        .body,
        [slot="footer"] {
            padding-inline: var(--card--Padding);
        }
    }

    ::slotted(.title) {
        display: inline-block;
        font-family: var(--theme--font-family--heading);
        font-size: .8em;
        font-weight: 800;
        text-transform: uppercase;
        margin-block-start: 0;
        margin-block-end: 1em;
        line-height: 1.8;
        padding: 0.2em calc(var(--spacing--horizontal) * 2);
        background-color: color-mix(in srgb, var(--theme--color--ui-accent) 10%, var(--theme--color--surface));
        box-sizing: border-box;
        inline-size: 100%;
    }

    ::slotted(.headline) {
        font-family: var(--theme--font-family--heading);
        font-size: 1.4em;
        font-weight: 600;
        line-height: 1.18;

        margin-block: 0;
    }

    ::slotted(.headline-summary) {
        font-size: 1.2em;
        font-weight: 400;
    }

    :host([featured], [accent]) ::slotted(.headline) {
        color: var(--headline--accent);
    }

    :host([bordered]) {
        --card--BorderWidth: 2px;
        --card--BorderColor: var(--theme--color--ui-subtle);
        --card--BackgroundColor: var(--theme--color--surface);
    }

    :host([bordered][featured]) {
        --card--BorderColor: color-mix(in srgb, var(--theme--color--ui-accent) 60%, var(--theme--color--surface));
    }

    :host([overflow]) {
        --card--BorderRadius: 5px;

        overflow: hidden;
        padding-block: 0;

        [slot="header"] {
            padding-inline: 0;
        }

        .body,
        [slot="footer"] {
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
                <div class="body">
                    <slot></slot>
                </div>
                <slot name="footer"></slot>`;

            this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
            this.shadowRoot.adoptedStyleSheets = [styles];
        }
    },
);
