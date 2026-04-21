const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        display: flex;
        flex-flow: row nowrap;
        gap: .6em;
    }

    .tags {
        font-size: .9em;

        display: flex;
        flex-flow: row wrap;
        gap: .5em;
        margin: 0;
    }

    .tag {
        display: inline-block;
        padding: .2em .4em;
        border-radius: var(--theme--BorderRadius);
        background-color: color-mix(in sRGB, var(--tag-background-color, var(--theme--ui--color)) var(--tag-background-opacity, 10%), transparent);

        text-decoration: none;
        color: inherit;
    }

    :host([caps]) .tag {
        text-transform: uppercase;
    }

    .tag-label {
        display: none;
        font-size: inherit;
        font-weight: var(--theme--FontWeight--thin);
        color: inherit;
        line-height: var(--theme--LineHeight--spacious);
    }

    :host([labeled]) {
        .tag-label {
            display: inline-block;
        }
    }
`);

customElements.define(
    "tag-group",
    class TagGroup extends HTMLElement {
        static get observedAttributes() {
            return ["tags", "filters", "url"];
        }

        _tags = [];

        get url() {
            return this.getAttribute("url") || "";
        }

        get showLink() {
            return this.hasAttribute("filters") ? true : false;
        }

        set showLink(value) {
            if (typeof value !== "boolean") {
                console.warn("[tag-group] showLink must be a boolean", value);
                return;
            }

            if (value) this.setAttribute("filters", "");
            else this.removeAttribute("filters");
        }


        get tags() {
            return this._tags;
        }

        set tags(value) {
            if (!Array.isArray(value) && typeof value !== "string") {
                console.warn("[tag-group] tags must be an array or a string", value);
                return;
            }

            // Check that each tag is a string
            if (Array.isArray(value) && value.some(tag => typeof tag !== "string")) {
                console.warn("[tag-group] tags must be an array of strings", value);
                return;
            }

            // If the value is a string, split it into an array of tags
            if (typeof value === "string") {
                if (value.length === 0) this._tags = [];
                else this._tags = value.split(",").map(tag => tag.trim());
            } else this._tags = value;

            // if (this._tags.length > 0) {
            //     this.setAttribute("tags", this._tags.join(","));
            // } else {
            //     this.removeAttribute("tags");
            // }
        }

        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this.setAttribute("role", "group");
        }

        render() {
            this.shadowRoot.innerHTML = "";

            if (this.tags.length === 0) return;

            const label = document.createElement("span");
            label.classList.add("tag-label");
            label.textContent = "tags:";
            this.shadowRoot.appendChild(label);

            const tags = document.createElement("p");
            tags.classList.add("tags");
            this.tags.forEach((label) => {
                const tag = document.createElement(this.showLink ? "a" : "span");
                tag.classList.add("tag");

                if (this.showLink) {
                    tag.href = `${this.url}?tag=${encodeURIComponent(label)}`;
                }

                tag.textContent = label;
                tags.appendChild(tag);
            });

            this.shadowRoot.appendChild(tags);
        }

        connectedCallback() {
            this.shadowRoot.adoptedStyleSheets = [styles];
            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "tags") {
                if (!newValue || typeof newValue !== "string") {
                    this.tags = [];
                } else {
                    this.tags = newValue.split(",").map(tag => tag.trim());
                }
            }
            else if (name === "filters") this.showLink = !!(newValue);
            this.render();
        }
    },
);
