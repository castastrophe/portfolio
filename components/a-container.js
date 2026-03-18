export default class AContainer extends HTMLElement {
    #observer;
    #tagName;

    stylesTemplate = (prefix = "") => {
        const identifier = prefix ? `${prefix}--` : "";
        const containerName = prefix && prefix !== "container" ? `box ${prefix}` : "box";
        return `
    :host {
        --default-background: transparent;
        --default-grid-areas: "header" "body" "footer";
        --default-padding-vertical: calc(var(--theme--container--space) * var(--multiplier-vertical, 1));
        --default-padding-horizontal: calc(var(--theme--container--space) * var(--multiplier-horizontal, 1));

        display: block;
        box-sizing: border-box;

        background: var(--${identifier}Background, var(--default-background));

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
        block-size: 100%; /* Ensure the container takes up the full height of its parent */
        margin-inline: auto; /* Center the container horizontally */

        padding-block: var(--${identifier}Padding--vertical, var(--default-padding-vertical));
        padding-inline: var(--${identifier}Padding--horizontal, var(--default-padding-horizontal));

        display: var(--${identifier}Display, grid);
        grid-template-areas: var(--${identifier}Grid--areas, var(--default-grid-areas));
        grid-template-columns: var(--${identifier}Grid--columns, 1fr);
        grid-template-rows: var(--${identifier}Grid--rows, auto 1fr auto);
        row-gap: var(--${identifier}Gap--vertical, calc(var(--theme--content--space) * var(--multiplier-vertical, 1)));
        column-gap: var(--${identifier}Gap--horizontal, calc(var(--theme--content--space) * var(--multiplier-horizontal, 2)));
        align-items: var(--${identifier}AlignItems, center);
        justify-content: var(--${identifier}JustifyContent, stretch);
    }

    ${["header", "body", "footer"].map(region => {
        const query = region !== "body" ? `[name="${region}"]` : ":not([name])";
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

            inline-size: min(var(--${identifier}${region}--Width, 100%), 100%);
            ${region === "body" ? 'block-size: 100%;' : ''}
            margin-inline: auto;

            grid-area: ${region};
        }`;
    }).join("\n")}

    :host([full]) {
        --${identifier}Width: 100%;
    }`;
    };

    constructor(tagName = "container") {
        super();
        this.attachShadow({ mode: "open" });

        this.#tagName = tagName;

        this.tagEmptySlots = this.tagEmptySlots.bind(this);
        this.stylesTemplate = this.stylesTemplate.bind(this);

        // Attach a mutation observer to the slots to check for content changes
        this.#observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === "childList") {
                    this.tagEmptySlots();
                }
            });
        });
    }

    connectedCallback() {
        const templateElement = document.createElement("template");
        templateElement.innerHTML = `
            <div class="container">
                <slot name="header"></slot>
                <slot class="body"></slot>
                <slot name="footer"></slot>
            </div>`;

        this.shadowRoot.appendChild(templateElement.content.cloneNode(true));

        const coreStyles = new CSSStyleSheet();
        // Replace the styles with the variable styles for the tag name
        coreStyles.replaceSync(this.stylesTemplate(this.#tagName));

        this.shadowRoot.adoptedStyleSheets.push(coreStyles);

        // Check if the slots have content; if not, attach an "empty" attribute for styling
        this.tagEmptySlots();

        this.#observer.observe(this.shadowRoot, { childList: true, subtree: true });
    }

    /**
     * Tag the empty slots with an "empty" attribute for styling
     */
    tagEmptySlots() {
        const slots = this.shadowRoot.querySelectorAll("slot");
        slots.forEach(slot => {
            if (slot.assignedNodes().length === 0) {
                slot.setAttribute("empty", "");
            } else {
                slot.removeAttribute("empty");
            }
        });
    }

    disconnectedCallback() {
        this.#observer.disconnect();
    }
}
