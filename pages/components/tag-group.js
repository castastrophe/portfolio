const styles = new CSSStyleSheet();
styles.replaceSync(`
    :host {
        --tag-background-color: var(--theme--color--ui-accent);
        --tag-background-base: var(--theme--color--surface);
        --tag-background-opacity: 10%;
        --tag-text-color: var(--headline);

        margin-block: 1em;

        display: flex;
        flex-flow: row nowrap;
        gap: 0.5rem;
    }

    .tags {
        display: flex;
        flex-flow: row wrap;
        gap: .5rem;
    }

    .tag {
        display: inline-block;
        font-size: 1em;
        font-weight: 800;
        color: var(--tag-text-color);
        padding: 0.2em 0.4em;
        border-radius: var(--border-radius);
        background-color: color-mix(in sRGB, var(--tag-background-color) var(--tag-background-opacity), var(--tag-background-base));

        a {
            text-decoration: none;
            color: inherit;

            &:visited {
                color: inherit;
            }
        }
    }

    .tag-label {
        display: none;
        font-size: 1em;
        font-weight: 100;
        color: var(--theme--color--text);
        line-height: 1.8;
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
        static observedAttribute = ["tags", "filters"];

        _tags = [];

        get showLink() {
            const hasAttribute = this.getAttribute("filters") === "true";
            return hasAttribute ? true : false;
        }

        set showLink(value) {
            if (typeof value !== "boolean") {
                console.warn("[tag-group] showLink must be a boolean", value);
                return;
            }

            if (value) this.setAttribute("filters", "true");
            else this.removeAttribute("filters");
        }


        get tags() {
            const tag_string = this.getAttribute("tags");
            if (!tag_string || typeof tag_string !== "string") return [];
            return tag_string.split(",").map(tag => tag.trim());
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

            this.setAttribute("tags", this._tags.join(","));
        }

        constructor() {
            super();
            this.shadowRoot = this.attachShadow({ mode: "open" });
            this.setAttribute("role", "group");
        }

        render() {
            this.shadowRoot.innerHTML = "";

            if (this.tags.length === 0) {
                return;
            }

            const label = document.createElement("span");
            label.classList.add("tag-label");
            label.textContent = "tags:";
            this.shadowRoot.appendChild(label);

            const tags = document.createElement("p");
            tags.classList.add("tags");
            this.tags.forEach((label) => {
                const span = document.createElement("span");
                span.classList.add("tag");

                if (url) {
                    const a = document.createElement("a");
                    // cursor todo: create dynamic tag filtering URL functionality to collection landing pages
                    a.href = `/?tag=${label}`;
                    a.textContent = label;
                    span.appendChild(a);
                } else {
                    span.textContent = label;
                }

                tags.appendChild(span);
            });

            this.shadowRoot.appendChild(tags);
        }

        connectedCallback() {
            this.shadowRoot.adoptedStyleSheets = [styles];
            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === "tags" || name === "filters") {
                if (name === "tags") this.tags = newValue;
                else if (name === "filters") this.showLink = !!(newValue);

                this.render();
            }
        }
    },
);
