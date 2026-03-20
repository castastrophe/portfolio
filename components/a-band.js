import AContainer from "./a-container.js";

const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        --default-padding-vertical: calc(var(--theme--container--space) * var(--multiplier-vertical, 1));
        --default-padding-horizontal: calc(var(--theme--container--space) * var(--multiplier-horizontal, 1));

        @scope (scope root) to (scope slot) {
            --multiplier-vertical: 2;
            --multiplier-horizontal: .5;
        }

        position: relative;
    }

    .container {
        margin-inline: auto; /* Center the container horizontally */

        padding-block: var(--band--Padding--vertical, var(--default-padding-vertical));
        padding-inline: var(--band--Padding--horizontal, var(--default-padding-horizontal));

    }

    slot:where([name="header"]:not([empty])) {
        --title--FontSize: 1.4rem;

        justify-content: var(--band--header--JustifyContent, start);
        inline-size: min(var(--band--header--Width, var(--theme--content--MaxWidth)), 100%);
        padding-block: calc(var(--theme--content--space) * 2);
    }

    slot:where(:not([name]):not([empty])) {
        flex-direction: var(--band--body--Direction, row);
        flex-wrap: var(--band--body--Wrap, wrap);
        justify-content: var(--band--body--JustifyContent, center);
    }

    slot:where([name="footer"]:not([empty])) {
        justify-content: var(--band--footer--JustifyContent, start);
        inline-size: min(var(--band--footer--Width, var(--theme--content--MaxWidth)), 100%);
        padding-block-start: var(--theme--content--space);

        border-width: var(--band--footer--BorderWidth, var(--theme--BorderWidth));
    }

    :host([accent]) {
        slot:where([name="footer"]:not([empty])) {
            border-color: var(--band--footer--BorderColor, var(--theme--ui--color));
        }
    }

    :host([collapsed]) {
        @scope (scope root) to (scope slot) {
            --multiplier-vertical: 0;
        }
    }

    :host([thin]) {
        @scope (scope root) to (scope slot) {
            --multiplier-vertical: 1;
        }
    }

    :host([thick]) {
        @scope (scope root) to (scope slot) {
            --multiplier-vertical: 4;
        }
    }

    :host([full]) {
        --band--body--Width: 100%;
        --band--footer--Width: 100%;
    }

    :host([space-between]) {
        --band--body--JustifyContent: space-between;
    }

    :host([space-evenly]) {
        --band--body--JustifyContent: space-evenly;
    }

    :host([space-around]) {
        --band--body--JustifyContent: space-around;
    }

    :host([grid]) {
        --band--body--Display: grid;
        --band--body--JustifyContent: center;

        slot:where(:not([name])) {
            grid-template-columns: repeat(var(--columns, auto-fill), minmax(var(--card--Width, var(--theme--content--MaxWidth)), 1fr));
        }
    }
`);

customElements.define(
	"a-band",
	class ABand extends AContainer {
		constructor() {
			super("band");
            if (!this.hasAttribute("role")) this.setAttribute("role", "region");
        }

        connectedCallback() {
            super.connectedCallback();
            this.shadowRoot.adoptedStyleSheets.push(styles);
		}
	},
);
