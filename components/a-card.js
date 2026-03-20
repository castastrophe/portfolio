import AContainer from "./a-container.js";

const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        --default-background: var(--theme--surface--color);
        --default-padding-vertical: calc(var(--theme--content--space) * var(--multiplier-vertical, 2));
        --default-padding-horizontal: calc(var(--theme--content--space) * var(--multiplier-horizontal, 1));

        border: var(--card--BorderWidth, 0) solid var(--card--BorderColor, var(--theme--ui--color--subtle));
        border-radius: var(--card--BorderRadius, var(--theme--BorderRadius));

        max-inline-size: min(var(--card--Width, var(--theme--content--MaxWidth)), 100%);
    }

    .container {
        margin-inline: auto; /* Center the container horizontally */

        padding-block: var(--card--Padding--vertical, var(--default-padding-vertical));
        padding-inline: var(--card--Padding--horizontal, var(--default-padding-horizontal));
    }

    slot:where([name="footer"]:not([empty])) {
        font-size: 1em;
        border-block-start: var(--card--footer--BorderWidth, var(--theme--BorderWidth)) solid var(--card--footer--BorderColor, var(--theme--ui--color--subtle));
        padding-block-start: var(--theme--content--space);
    }

    :host([overflow]) {
        --header--item--Width: calc(100% + var(--card--Padding--horizontal, var(--default-padding-horizontal)) * 2);

        overflow: hidden;

        slot[name="header"]:not([empty]) {
            --title--Padding: var(--theme--content--space) var(--card--Padding--horizontal, var(--default-padding-horizontal));

            background: var(--theme--surface--color--accent);

            margin-block-start: calc(var(--card--Padding--vertical, var(--default-padding-vertical)) * -1);
            margin-inline: calc(var(--card--Padding--horizontal, var(--default-padding-horizontal)) * -1);
            inline-size: var(--header--item--Width);

            ::slotted(*:is(iframe, picture, image)) {
                --video--Width: var(--header--item--Width);
                --image-size: var(--header--item--Width);

                margin-block-start: calc(var(--card--Padding--vertical, var(--default-padding-vertical)) * -1);
                margin-inline: calc(var(--card--Padding--horizontal, var(--default-padding-horizontal)) * -1);
                inline-size: var(--header--item--Width);
            }

            ::slotted(*:not(:is(iframe, picture, image))) {
                padding-inline: var(--card--Padding--horizontal, var(--default-padding-horizontal));
            }

            ::slotted(*:not(:is(iframe, picture, image)):first-child) {
                padding-block: var(--card--Padding--vertical, var(--default-padding-vertical));
            }
        }
    }

    :host([video]) {
        --card--Padding--horizontal: calc(var(--theme--content--space) * 2);

        slot[name="header"]:not([empty]) {
            background: none;
        }

        slot:where(:not([name]):not([empty])) {
            --video--Width: 365px;

            font-size: max(.8em, 10px);
        }
    }

    @container card (width >= 600px) {
        :host([video]) .container {
            --card--Grid--areas: "header body" "header footer";
            --card--Grid--columns: var(--card--Width, 300px) 1fr;
            --card--Grid--rows: 1fr auto;
            --card--Gap--horizontal: calc(var(--theme--content--space) * 4);
        }
    }

    :host([bordered]) {
        --card--BorderWidth: var(--theme--BorderWidth);
    }

    :host([bordered][featured]) {
        --card--BorderColor: color-mix(in srgb, var(--theme--ui--color) 40%, var(--theme--surface--color));
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
