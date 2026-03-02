const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: block;
        box-sizing: border-box;

        scroll-margin: 10px;
        scroll-snap-align: start;
        scroll-snap-stop: normal;

        background: var(--band--BackgroundColor, transparent);

        inline-size: var(--band--Width, 100%);
        max-inline-size: calc(100vw - (var(--spacing--horizontal) * var(--multiplier-horizontal, .6) * 2));
        margin-inline: auto;
        padding-block: calc(var(--spacing--vertical) * var(--multiplier-vertical, 2));
        padding-inline: calc(var(--spacing--horizontal) * var(--multiplier-horizontal, .6));
    }

    :host([padding="half"]) {
        --multiplier-vertical: .5;
    }

    :host([padding="double"]) {
        --multiplier-vertical: 2;
    }

    :host([padding="none"]) {
        --multiplier-vertical: 0;
    }

    /* Default layout for all regions is stacked */
    :host,
    slot:has([name="header"]),
    slot:not(:has([name])),
    slot:has([name="footer"]),
    ::slotted([layout="stacked"]) {
        display: flex;
        flex-flow: column nowrap;
        row-gap: var(--spacing--vertical);
        column-gap: var(--spacing--horizontal);
        align-items: center;
    }

    slot:has([name="header"]),
    slot:not(:has([name])),
    slot:has([name="footer"]) {
        box-sizing: border-box;
        justify-content: start;
        align-items: center;
    }

    slot:has([name="header"]),
    slot:not(:has([name])) {
        ::slotted(.title) {
            display: block;
            font-family: var(--theme--font-family--heading);
            font-size: 1.1em;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--theme--color--text);
            padding: 0.1em var(--spacing--horizontal);
            border-radius: var(--border-radius);
            background-color: color-mix(in srgb, var(--theme--color--ui-accent) var(--title-accent-opacity, 10%), var(--theme--color--surface));
            inline-size: var(--title-inline-size, var(--title-inline-size, min(80ch, 100%)));
            box-sizing: border-box;
        }
    }

    slot:has([name="header"]) {
        inline-size: min(80ch, 100%);
        align-items: stretch;

        ::slotted(p) {
            background-color: color-mix(in srgb, var(--theme--color--surface) 80%, transparent);
            align-self: start;
            text-align: start;
        }

        ::slotted(.title) {
            text-align: center;
        }
    }

    slot:not(:has([name])) {
        flex-grow: 1;
        inline-size: 100%;
        position: relative;
    }

    :host([layout="space-between"]) slot:not(:has([name])) {
        flex-flow: row wrap;
        justify-content: space-between;
    }

    :host([layout="space-evenly"]) slot:not(:has([name])) {
        flex-flow: row wrap;
        justify-content: space-evenly;
    }

    :host([layout="space-around"]) slot:not(:has([name])),
    ::slotted([layout="space-around"]) {
        flex-flow: row wrap;
        justify-content: center;
        align-items: stretch;
        row-gap: calc(var(--spacing--horizontal) * 2);
        column-gap: var(--spacing--horizontal);
    }

    ::slotted([layout="space-around"]) {
        --spacing--vertical: .2em;
        --spacing--horizontal: .2em;

        display: flex;
        flex-grow: 1;
        inline-size: 100%;
    }

    :host([layout="auto-grid"]) slot:not(:has([name])) {
        --spacing--vertical: .5em;

        display: grid;
        grid-template-columns: repeat(var(--grid-columns, auto-fit), minmax(var(--card-Width, 325px), 1fr));
        align-items: var(--align-items, stretch);
        justify-content: var(--justify-content, space-around);

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
