export default class AContainer extends HTMLElement {
    #regions = ["header", "body", "footer"];
    #tagName = "box";
	stylesTemplate = () => {
		const identifier = `${this.#tagName}--`;
		const containerName = this.#tagName !== "container" ? `${this.#tagName} ${this.#tagName}` : this.#tagName;
		return `
    :host {
        --default-grid-areas: ${this.#regions.map(region => `"${region}"`).join(" ")};
        --default-grid-columns: ${this.#regions.map(() => `1fr`).join(" ")};
        --default-grid-rows: ${this.#regions.map(() => `1fr`).join(" ")};

        display: block;
        box-sizing: border-box;

        background: var(--${identifier}Background, var(--default-background, transparent));

        container-name: ${containerName};
        container-type: inline-size;

        inline-size: 100%;
    }

    slot:is([empty]) {
        display: none;
    }

    .container {
        box-sizing: border-box;
        inline-size: min(var(--${identifier}Width, var(--theme--container--MaxWidth)), 100%);
        block-size: 100%;

        display: var(--${identifier}Display, grid);
        grid-template-areas: var(--${identifier}Grid--areas, var(--default-grid-areas));
        grid-auto-columns: var(--${identifier}Grid--columns, 1fr);
        grid-auto-rows: var(--${identifier}Grid--rows, auto 1fr auto);
        row-gap: var(--${identifier}Gap--vertical, calc(var(--theme--content--space) * var(--multiplier-vertical, 1)));
        column-gap: var(--${identifier}Gap--horizontal, calc(var(--theme--content--space) * var(--multiplier-horizontal, 2)));
        align-items: var(--${identifier}AlignItems, stretch);
        justify-content: var(--${identifier}JustifyContent, center);
    }

    ${this.#regions.map(region => {
		const query = !["default", "body"].includes(region) ? `[name="${region}"]` : ":not([name])";
		return `
        slot:where(${query}) {
            box-sizing: border-box;
            display: var(--${identifier}${region}--Display, flex);
            flex-direction: var(--${identifier}${region}--Direction, column);
            flex-wrap: var(--${identifier}${region}--Wrap, nowrap);
            row-gap: var(--${identifier}${region}--Gap--vertical, var(--theme--content--space));
            column-gap: var(--${identifier}${region}--Gap--horizontal, var(--theme--content--space));
            align-items: var(--${identifier}${region}--AlignItems, stretch);
            justify-content: var(--${identifier}${region}--JustifyContent, start);

            inline-size: min(var(--${identifier}${region}--Width, var(--theme--content--MaxWidth)), 100%);
            ${region === "body" ? "block-size: 100%;" : ""}
            margin-inline: auto;

            grid-area: ${region};
        }`;
	}).join("\n")}

    ${this.#regions.filter(region => region === "header").map(region => `
        slot:where([name="${region}"]:not([empty])) {
            border-block-end: var(--${identifier}${region}--BorderWidth, 0) solid var(--band--${region}--BorderColor, var(--theme--ui--color--subtle));
        }
    `).join("\n")}

    ${this.#regions.filter(region => region === "footer").map(region => `
        slot:where([name="${region}"]:not([empty])) {
            border-block-start: var(--${identifier}${region}--BorderWidth, 0) solid var(--${identifier}${region}--BorderColor, var(--theme--ui--color--subtle));
        }
    `).join("\n")}

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
        --${identifier}Width: 100%;
        ${this.#regions.filter(region => region !== "header").map(region => `
            --${identifier}${region}--Width: 100%;
        `).join("\n")}
    }`;
	};

	constructor(tagName, regions) {
		super();
		this.attachShadow({ mode: "open" });

        this.#tagName = tagName ?? "box";
		this.#regions = regions ?? ["header", "body", "footer"];

		const template = document.createElement("template");
		template.innerHTML = `
            <div class="container">
                ${this.#regions.map(region => {
                    if (["default", "body"].includes(region)) return `<slot></slot>`;
                    return `<slot name="${region}"></slot>`;
                }).join("\n")}
            </div>`;
		this.shadowRoot.appendChild(template.content.cloneNode(true));

		const sheet = new CSSStyleSheet();
		sheet.replaceSync(this.stylesTemplate());
		this.shadowRoot.adoptedStyleSheets = [sheet];

		this.shadowRoot.querySelectorAll("slot").forEach(slot => {
			slot.addEventListener("slotchange", () => this.tagEmptySlots());
		});
	}

	connectedCallback() {
		this.tagEmptySlots();
	}

	tagEmptySlots() {
		this.shadowRoot.querySelectorAll("slot").forEach(slot => {
			slot.toggleAttribute("empty", slot.assignedNodes().length === 0);
		});
	}
}

customElements.define("a-box", AContainer);
