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
		margin-inline: auto;

		padding-block: var(--band--Padding--vertical, var(--default-padding-vertical));
		padding-inline: var(--band--Padding--horizontal, var(--default-padding-horizontal));

		&:has(slot[name="aside"]:not([empty])) {
			--default-grid-areas: "header header" "body aside" "footer footer";
			--default-grid-columns: auto min(var(--band--aside--Width, 350px), 100%);

			inline-size: min(calc(var(--band--Width, var(--theme--container--MaxWidth)) + var(--band--aside--Width, 350px)), 100%);
		}
	}

	slot:where([name="header"]:not([empty])) {
		justify-content: var(--band--header--JustifyContent, start);
		padding-block-end: calc(var(--theme--content--space) * 2);
	}

	slot:where(:not([name]):not([empty])) {
		flex-direction: var(--band--body--Direction, row);
		flex-wrap: var(--band--body--Wrap, wrap);
		justify-content: var(--band--body--JustifyContent, center);
	}

	slot:where([name="footer"]:not([empty])) {
		justify-content: var(--band--footer--JustifyContent, start);
		padding-block-start: var(--theme--content--space);

		border-width: var(--band--footer--BorderWidth, var(--theme--BorderWidth));
	}

	:host([accent]) {
		slot:where([name="footer"]:not([empty])) {
			border-color: var(--band--footer--BorderColor, var(--theme--ui--color));
		}
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
			super("band", ["header", "body", "aside", "footer"]);
			this.shadowRoot.adoptedStyleSheets.push(styles);
			if (!this.hasAttribute("role")) this.setAttribute("role", "region");
		}
	},
);
