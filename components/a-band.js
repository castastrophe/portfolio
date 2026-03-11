const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        position: relative;

        scroll-margin: var(--theme--container--space);
        scroll-snap-align: start;
        scroll-snap-stop: normal;

        background: var(--band--Background, transparent);

        inline-size: min(var(--band--Width, 1200px), 100%);
        max-inline-size: calc(100vw - var(--band--Padding--horizontal, calc(var(--theme--container--space) * var(--multiplier-horizontal, .6))) * 2);
        margin-inline: auto; /* Center the band horizontally */

        padding-block: var(--band--Padding--vertical, calc(var(--theme--container--space) * var(--multiplier-vertical, 2)));
        padding-inline: var(--band--Padding--horizontal, calc(var(--theme--container--space) * var(--multiplier-horizontal, .6)));

        display: var(--band--Display, flex);
        flex-direction: var(--band--Direction, column);
        flex-wrap: var(--band--Wrap, nowrap);
        row-gap: var(--band--Gap--vertical, var(--theme--content--space));
        column-gap: var(--band--Gap--horizontal, var(--theme--content--space));
        align-items: var(--band--AlignItems, center);
        justify-content: var(--band--JustifyContent, start);

        container: band / inline-size;

        &,
        slot {
            box-sizing: border-box;
        }
    }

    :host([padding="half"]) {
        --multiplier-vertical: .5;
    }

    :host([padding="double"]) {
        --multiplier-vertical: 4;
    }

    slot:where([name="header"]) {
        display: var(--band--header--Display, flex);
        flex-direction: var(--band--header--Direction, column);
        flex-wrap: var(--band--header--Wrap, nowrap);
        row-gap: var(--band--header--Gap--vertical, var(--theme--content--space));
        column-gap: var(--band--header--Gap--horizontal, var(--theme--content--space));
        align-items: var(--band--header--AlignItems, stretch);
        justify-content: var(--band--header--JustifyContent, start);

        inline-size: min(var(--band--header--Width, 80ch), 100%);

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
    slot:where(:not([name])) {
        flex-grow: 1;

        display: var(--band--body--Display, flex);
        flex-direction: var(--band--body--Direction, column);
        flex-wrap: var(--band--body--Wrap, nowrap);
        row-gap: var(--band--body--Gap--vertical, var(--theme--content--space));
        column-gap: var(--band--body--Gap--horizontal, var(--theme--content--space));
        align-items: var(--band--body--AlignItems, center);
        justify-content: var(--band--body--JustifyContent, start);
        inline-size: min(var(--band--body--Width, 80ch), 100%);

        :host([center]) & {
            --band--body--Direction: row;
            --band--body--JustifyContent: center;
        }

        :host([space-between]) & {
            --band--body--Direction: row;
            --band--body--JustifyContent: space-between;
        }

        :host([space-evenly]) & {
            --band--body--Direction: row;
            --band--body--JustifyContent: space-evenly;
        }

        :host([space-around]) & {
            --band--body--Direction: row;
            --band--body--JustifyContent: space-around;
        }

        :host([wrap]) & {
            --band--body--Wrap: wrap;
        }

        :host([grid]) & {
            --band--body--Display: grid;
            --band--body--AlignItems: stretch;
            --band--body--JustifyContent: space-around;

            grid-template-columns: repeat(var(--columns, auto-fit), minmax(var(--item--Width, 325px), 1fr));

            ::slotted(a-card) {
                justify-self: center;
            }
        }
    }

    ::slotted(.title) {
        margin-block: 0;
    }

    slot:where([name="footer"]) {
        display: var(--band--footer--Display, flex);
        flex-direction: var(--band--footer--Direction, column);
        flex-wrap: var(--band--footer--Wrap, nowrap);
        row-gap: var(--band--footer--Gap--vertical, var(--theme--content--space));
        column-gap: var(--band--footer--Gap--horizontal, var(--theme--content--space));
        align-items: var(--band--footer--AlignItems, center);
        justify-content: var(--band--footer--JustifyContent, start);
        inline-size: min(var(--band--footer--Width, 80ch), 100%);
    }

    :host([full]) {
        --band--Width: 90%;
    }

    @media screen and (width >= 980px) {
        :host {
            justify-content: var(--band--JustifyContent, center);
        }
    }

    @media screen and (min-width: 1220px) {
        :host(:not([full])) {
            max-inline-size: 1200px;
        }
    }

    @media print {
        :host {
            border: none;
        }

        :host([full]) {
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
