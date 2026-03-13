import AContainer from "./a-container.js";

const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        --default-background: var(--theme--surface--color);
        --default-padding-vertical: calc(var(--theme--content--space) * var(--multiplier-vertical, 2));
        --default-padding-horizontal: calc(var(--theme--content--space) * var(--multiplier-horizontal, 1));

        border: var(--card--BorderWidth, 0) solid var(--card--BorderColor, var(--theme--ui--Color--subtle));
        border-radius: var(--card--BorderRadius, var(--theme--BorderRadius));

        max-inline-size: min(var(--card--Width, var(--theme--content--MaxWidth)), 100%);
    }

    :host([overflow]) {
        overflow: hidden;

        slot[name="header"]:not([empty]) {
            background: color-mix(in srgb, var(--theme--ui--Color) 20%, var(--theme--surface--color));

            padding-inline: var(--card--Padding--horizontal, var(--default-padding-horizontal));
            padding-block: var(--card--Padding--horizontal, var(--default-padding-horizontal));

            margin-block-start: calc(var(--card--Padding--vertical, var(--default-padding-vertical)) * -1);
            margin-inline: calc(var(--card--Padding--horizontal, var(--default-padding-horizontal)) * -1);
            inline-size: calc(100% + var(--card--Padding--horizontal, var(--default-padding-horizontal)) * 2);
        }
    }

    :host([video]) {
        /* Used to limit the width of the video iframe in the card */
        max-inline-size: min(var(--card--Width, var(--item--Width)), 100%);
        overflow: hidden;

        ::slotted(iframe) {
            --video--Width: 100cqi;

            margin-block-start: calc(var(--card--Padding--vertical, var(--default-padding-vertical)) * -1);
            margin-inline: calc(var(--card--Padding--horizontal, var(--default-padding-horizontal)) * -1);
        }
    }

    @container card (width >= 800px) {
        :host([video]) {
            --card--header--Width: var(--video--Width);
            --card--body--Width: max-content;
            --card--Gap--horizontal: calc(var(--theme--content--space) * 2);

            --card--Display: grid;

            .container {
                grid-template-areas: "header body" "header footer";
                grid-template-columns: var(--video--Width) 1fr;
                grid-template-rows: 1fr auto;
            }
        }
    }

    ::slotted(tag-group) {
        font-size: .8em;
        margin-block-start: var(--theme--content--space);
    }

    :host([bordered]) {
        --card--BorderWidth: var(--theme--BorderWidth);
    }

    :host([bordered][featured]) {
        --card--BorderColor: color-mix(in srgb, var(--theme--ui--Color) 60%, var(--theme--surface--color));
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
    class ACard extends AContainer {

        constructor() {
            super("card");
        }

        connectedCallback() {
            super.connectedCallback();
            this.shadowRoot.adoptedStyleSheets.push(styles);
        }
    },
);
