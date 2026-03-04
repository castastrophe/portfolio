const styles = new CSSStyleSheet();
styles.replaceSync(`
    @property --band--Background {
        syntax: "<color>";
        inherits: false;
        initial-value: transparent;
    }

    @property --band--Width {
        syntax: "<length>";
        inherits: false;
        initial-value: 100%;
    }

    @property --band--Padding--horizontal {
        syntax: "<length>";
        inherits: false;
        initial-value: calc(var(--spacing--horizontal) * var(--multiplier-horizontal, .6));
    }

    @property --band--Padding--vertical {
        syntax: "<length>";
        inherits: false;
        initial-value: calc(var(--spacing--vertical) * var(--multiplier-vertical, 2));
    }

    @property --band--Gap--horizontal {
        syntax: "<length>";
        inherits: false;
        initial-value: var(--spacing--horizontal);
    }

    @property --band--Gap--vertical {
        syntax: "<length>";
        inherits: false;
        initial-value: var(--spacing--vertical);
    }

    @property --band--Display {
        syntax: "<string>";
        inherits: false;
        initial-value: flex;
    }

    @property --band--Direction {
        syntax: "<string>";
        inherits: false;
        initial-value: column;
    }

    @property --band--Wrap {
        syntax: "<string>";
        inherits: false;
        initial-value: nowrap;
    }

    @property --band--AlignItems {
        syntax: "<string>";
        inherits: false;
        initial-value: center;
    }

    @property --band--JustifyContent {
        syntax: "<string>";
        inherits: false;
        initial-value: start;
    }

    @property --multiplier-horizontal {
        syntax: "<number>";
        inherits: false;
        initial-value: .6;
    }

    @property --multiplier-vertical {
        syntax: "<number>";
        inherits: false;
        initial-value: 2;
    }

    :host {
        position: relative;
        
        scroll-margin: 10px;
        scroll-snap-align: start;
        scroll-snap-stop: normal;

        background: var(--band--Background, transparent);

        inline-size: var(--band--Width, 100%);
        max-inline-size: calc(100vw - var(--band--Padding--horizontal, calc(var(--spacing--horizontal) * var(--multiplier-horizontal, .6))) * 2);
        margin-inline: auto; /* Center the band horizontally */

        padding-block: var(--band--Padding--vertical, calc(var(--spacing--vertical) * var(--multiplier-vertical, 2)));
        padding-inline: var(--band--Padding--horizontal, calc(var(--spacing--horizontal) * var(--multiplier-horizontal, .6)));

        container: band / inline-size;
    }

    :host([padding="half"]) {
        --multiplier-vertical: .5;
    }

    :host([padding="double"]) {
        --multiplier-vertical: 2;
    }

    /* Default layout for all regions is stacked */
    :host,
    slot {
        box-sizing: border-box;

        display: var(--band--Display, flex);
        flex-direction: var(--band--Direction, column);
        flex-wrap: var(--band--Wrap, nowrap);
        row-gap: var(--band--Gap--vertical, var(--spacing--vertical));
        column-gap: var(--band--Gap--horizontal, var(--spacing--horizontal));
        align-items: var(--band--AlignItems, center);
        justify-content: var(--band--JustifyContent, start);
    }

    slot:where([name="header"]) {
        --band--AlignItems: stretch;

        inline-size: min(80ch, 100%);

        ::slotted(p) {
            background-color: color-mix(in srgb, var(--theme--surface--color) 80%, transparent);
            align-self: start;
            text-align: start;
        }

        ::slotted(.title) {
            text-align: center;
        }
    }

    /* Default slot */
    slot:not(:has([name])) {
        flex-grow: 1;
        inline-size: 100%;
        position: relative;
    }

    :host([layout="space-between"]) slot:not(:has([name])) {
        --band--Direction: row;
        --band--Wrap: wrap;
        --band--JustifyContent: space-between;
    }

    :host([layout="space-evenly"]) slot:not(:has([name])) {
        --band--Direction: row;
        --band--Wrap: wrap;
        --band--JustifyContent: space-evenly;
    }

    :host([layout="space-around"]) {
        --spacing--vertical: .2em;
        --spacing--horizontal: .2em;

        flex-grow: 1;

        slot:not(:has([name])) {
            --band--Direction: row;
            --band--Wrap: wrap;
            --band--JustifyContent: center;
            --band--AlignItems: stretch;
            --band--Gap--vertical: calc(var(--spacing--horizontal) * 2);
            --band--Gap--horizontal: var(--spacing--horizontal);
        }
    }

    :host([layout="auto-grid"]) slot:not(:has([name])) {
        --spacing--vertical: .5em;

        --band--Display: grid;
        --band--AlignItems: stretch;
        --band--JustifyContent: space-around;

        grid-template-columns: repeat(var(--grid-columns, auto-fit), minmax(var(--card-Width, 325px), 1fr));

        ::slotted(a-card) {
            justify-self: center;
        }
    }

    :host([overflow]) {
        --band--Padding--horizontal: 0;
        --band--Width: min(80ch, 90%);

        slot:not(:has([name])) {
            flex-flow: row nowrap;
            overflow: auto;
        }
    }

    :host([width="full"]) {
        --band--Width: 90%;
    }

    @media screen and (width >= 980px) {
        :host {
            align-items: center;
            justify-content: center;
        }

        :host([overflow]) {
            --band--Width: 100%;
        }

        :host([overflow][layout="auto-grid"]) slot:not(:has([name])) {
            width: 100%;
            /* Create some gutter for the overflow scroll */
            padding-block-end: var(--spacing--vertical, 1em);
        }
    }

    @media screen and (min-width: 1220px) {
        :host(:not([width="full"])) {
            max-inline-size: 1200px;
        }
    }

    @media print {
        :host {
            border: none;
        }

        :host([width="full"]) {
            padding: 1em 0;
        }
    }
`);

customElements.define(
	"a-band",
	class ABand extends HTMLElement {
		constructor() {
			super();
            this.setAttribute("role", "region");
            this.attachShadow({ mode: "open" });
        }

        connectedCallback() {
            const templateElement = document.createElement("template");
            templateElement.innerHTML = `
                <slot name="header"></slot>
                <slot class="body"></slot>
                <slot name="footer"></slot>`;

			this.shadowRoot.appendChild(templateElement.content.cloneNode(true));
            this.shadowRoot.adoptedStyleSheets = [styles];
		}
	},
);
