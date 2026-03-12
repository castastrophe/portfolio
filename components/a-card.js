const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        --static--padding: calc(var(--theme--content--space) * 2);

        background: var(--card--Background, var(--theme--surface--color));
        color: var(--card--text--Color, inherit);

        border: var(--card--BorderWidth, 0) solid var(--card--BorderColor, transparent);
        border-radius: var(--card--BorderRadius, 0);

        inline-size: min(var(--card--Width, 80ch), 100%);

        display: var(--card--Display, flex);
        flex-direction: var(--card--Direction, column);
        flex-wrap: var(--card--Wrap, nowrap);
        row-gap: var(--card--Gap--vertical, 0);
        column-gap: var(--card--Gap--horizontal, 0);
        align-items: var(--card--AlignItems, stretch);
        justify-content: var(--card--JustifyContent, start);

        padding-block: var(--card--Padding, var(--static--padding));
        /* Note: inline padding appears on the individual slots, not the host */

        font-size: clamp(1em, 1vw, 1.3em);

        container: card / inline-size;

        &,
        slot {
            box-sizing: border-box;
        }

        slot {
            display: block;
        }
    }

    slot:where(:not([name])) {
        flex-grow: 1;
    }

    :host(:where(:not([overflow]))) slot {
        padding-inline: var(--card--Padding, var(--static--padding));
    }

    :host([video]) {
        --card--video--Width: 400px;
        --card--Width: calc(80ch + var(--card--video--Width));
    }

    @container card (width < 800px) {
        :host([video]) ::slotted(.video-container) {
            margin-inline: calc(var(--card--Padding, var(--static--padding)) * -1);
            margin-block-start: calc(var(--card--Padding, var(--static--padding)) * -1);
        }
    }

    @container card (width >= 800px) {
        :host([video]) slot:where(:not([name])) {
            flex-flow: row nowrap;
            column-gap: var(--theme--content--space);

            ::slotted(.video-container) {
                inline-size: min(var(--card--video--Width), 100%);
                block-size: auto;
            }

            ::slotted(.content) {
                flex-grow: 1;
                inline-size: calc(100% - var(--card--video--Width));
            }
        }
    }

    ::slotted(.title) {
        --title--LineHeight: 1.8;
        --title--Padding: 0 var(--static--padding) .2em;
    }

    ::slotted(.headline) {
        font-size: 1.4em;
        font-weight: var(--theme--FontWeight--semi-bold);
        margin-block-end: .2em;
    }

    ::slotted(iframe) {
        padding: 0;
    }

    ::slotted(tag-group) {
        font-size: .8em;
        margin-block-start: var(--theme--content--space);
    }

    :host([bordered]) {
        --card--BorderWidth: 2px;
        --card--BorderColor: var(--theme--ui--Color--subtle);
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
            padding-inline: var(--card--Padding, var(--static--padding));
        }
    }
    :host([overflow][bordered]) {
        --card--BorderColor: transparent;
        --card--Gap--vertical: 0;

        slot:where([name="header"]) {
            border: var(--card--BorderWidth, 2px) solid var(--theme--ui--Color);
            background: color-mix(in srgb, var(--theme--ui--Color) 20%, var(--theme--surface--color));
        }

        slot:where([name="footer"], :not([name])) {
            padding-inline: var(--card--Padding, var(--static--padding));
            border-inline: var(--card--BorderWidth, 2px) solid var(--theme--ui--Color--subtle);
            padding-block: var(--card--Padding, var(--static--padding));
        }

        slot:where([name="footer"]) {
            border-block-end: var(--card--BorderWidth, 2px) solid var(--theme--ui--Color--subtle);
            padding-block-end: var(--card--Padding, var(--static--padding));
            border-end-start-radius: var(--card--BorderRadius, 0);
            border-end-end-radius: var(--card--BorderRadius, 0);
        }

        ::slotted(*) {
            --title--Padding: .8em var(--theme--content--space);
        }
    }

    :host([overflow]:has([name="footer"])) [slot="footer"] {
        padding-block-end: var(--card--Padding, var(--static--padding));
    }

    :host([overflow]:not([bordered])) {
        gap: 0;

        ::slotted(*) {
            padding-inline: var(--card--Padding, var(--static--padding));
        }
    }

    @media print {
        :host(:not([featured])) {
            border: none;
        }

        ::slotted(.title) {
            background: none;
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
