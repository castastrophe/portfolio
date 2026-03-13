import AContainer from "./a-container.js";

const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        @scope (scope root) to (scope slot) {
            --multiplier-vertical: 2;
            --multiplier-horizontal: .5;
        }

        position: relative;
    }

    slot:where([name="header"]:not([empty])) {
        justify-content: var(--band--header--JustifyContent, start);
        inline-size: min(var(--band--header--Width, var(--theme--content--MaxWidth)), 100%);
        padding-block: calc(var(--theme--content--space) * 2);
    }

    slot:where(:not([name]):not([empty])) {
        flex-direction: var(--band--body--Direction, row);
        flex-wrap: var(--band--body--Wrap, wrap);
    }

    slot:where([name="footer"]:not([empty])) {
        justify-content: var(--band--footer--JustifyContent, start);
        inline-size: min(var(--band--footer--Width, var(--theme--content--MaxWidth)), 100%);
        border-block-start: var(--theme--BorderWidth) solid var(--band--footer--BorderColor, var(--theme--ui--Color--subtle));
        padding-block-start: var(--theme--content--space);
    }

    :host([accent]) {
        slot:where([name="footer"]:not([empty])) {
            border-color: var(--band--footer--BorderColor, var(--theme--ui--Color));
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
        slot:where(:not([name])) {
            display: grid;
            grid-template-columns: repeat(var(--columns, auto-fill), minmax(var(--item--Width, var(--theme--content--MaxWidth)), 1fr));
        }
    }
`);

customElements.define(
	"a-band",
	class ABand extends AContainer {
		constructor() {
			super("band");
            this.setAttribute("role", "region");
        }

        connectedCallback() {
            super.connectedCallback();
            this.shadowRoot.adoptedStyleSheets.push(styles);
		}
	},
);
