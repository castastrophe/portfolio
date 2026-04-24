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

    :is(.tag, .clear) {
        display: inline-flex;
        padding: .2em .4em;
        cursor: pointer;
        background-color: color-mix(in sRGB, var(--tag-background-color, var(--theme--ui--color)) var(--tag-background-opacity, 10%), transparent);
        border-radius: var(--theme--BorderRadius);
        border: var(--theme--BorderWidth--thin) solid transparent;

        text-decoration: none;
        color: inherit;

        &:not([aria-disabled="true"]) {
            &:is(:focus, :focus-visible) {
                outline: 1px solid var(--theme--ui--color--active);
                outline-offset: var(--theme--OutlineOffset, 1px);
            }

            &:hover {
                border-color: var(--theme--ui--color--active);
            }
        }

        &[aria-disabled="true"] {
            opacity: .45;
            cursor: default;
            text-decoration: line-through;
            text-decoration-thickness: .1em;
            text-decoration-color: var(--theme--ui--color);

            &:is(:focus, :focus-visible) {
                outline: 1px solid var(--theme--text--Color--subtle);
            }
        }

        &[aria-active="true"] {
            background-color: var(--theme--ui--color);
            color: var(--theme--text--Color--invert);
            border-color: var(--theme--ui--color);
        }
    }

    .clear {
        background-color: var(--theme--surface--color--emphasis);
        font-size: inherit;
    }

    :host([caps]) .tag { text-transform: uppercase; }
    :host([controls]) .tag { padding: .2em .6em; }

    .tag-label { display: none; }

    :host([labeled]) {
        .tag-label {
            display: inline-block;
            font-size: inherit;
            font-weight: var(--theme--FontWeight--thin);
            color: inherit;
            line-height: var(--theme--LineHeight--spacious);
        }
    }
`);

customElements.define(
    "tag-group",
    class TagGroup extends HTMLElement {
        #onClickBound;
        #onPopStateBound;
        #scopeRoot;

        static observedAttributes = ["tags", "filters", "url", "controls"];

        #tags = [];

        get url() {
            return this.getAttribute("url") || "";
        }

        get linkTag() {
            return this.hasAttribute("filters");
        }

        set linkTag(value) {
            if (typeof value !== "boolean") {
                console.warn("[tag-group] linkTag must be a boolean", value);
                return;
            }
            this.toggleAttribute("filters", value);
        }

        get controls() {
            return this.hasAttribute("controls");
        }

        get tags() {
            return this.#tags;
        }

        set tags(value) {
            if (!Array.isArray(value) && typeof value !== "string") {
                console.warn("[tag-group] tags must be an array or a string", value);
                return;
            }

            if (Array.isArray(value) && value.some(tag => typeof tag !== "string")) {
                console.warn("[tag-group] tags must be an array of strings", value);
                return;
            }

            if (typeof value === "string") {
                this.#tags = value.length === 0 ? [] : value.split(",").map(tag => tag.trim());
            } else {
                this.#tags = value;
            }
        }

        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this.setAttribute("role", "group");
            this.shadowRoot.adoptedStyleSheets = [styles];
            this.#onClickBound = this.#onClick.bind(this);
            this.#onPopStateBound = this.#onPopState.bind(this);
        }

        renderLabel() {
            if (!this.hasAttribute("labeled")) return;

            const label = document.createElement("span");
            label.classList.add("tag-label");
            label.textContent = "tags:";

            this.shadowRoot.appendChild(label);
        }

        #getActiveTags() {
            const params = new URLSearchParams(window.location.search);
            const activeTags = params.getAll("tag").map(tag => tag.trim()).filter(Boolean);
            if (activeTags.length > 0) return activeTags;

            const legacyTag = params.get("tag");
            if (!legacyTag) return [];
            return legacyTag.split(",").map(tag => tag.trim()).filter(Boolean);
        }

        #buildFilterHref(value, { clear = false } = {}) {
            const baseUrl = new URL(this.url || window.location.pathname, window.location.origin);
            baseUrl.searchParams.delete("tag");

            if (!clear) {
                const nextTags = this.#getToggledTags(value);
                nextTags.forEach(tag => baseUrl.searchParams.append("tag", tag));
            }

            return `${baseUrl.pathname}${baseUrl.search}`;
        }

        #getToggledTags(value) {
            const normalizedValue = value?.trim() ?? "";
            const activeTags = this.#getActiveTags();
            if (!normalizedValue) return activeTags;

            if (activeTags.includes(normalizedValue)) {
                return activeTags.filter(tag => tag !== normalizedValue);
            }

            return [...activeTags, normalizedValue];
        }

        renderTag(label, value = label) {
            if (!label) return;

            const tag = document.createElement(this.linkTag ? "a" : "span");
            tag.classList.add("tag");

            if (this.linkTag) {
                const normalizedValue = value?.trim() ?? "";
                tag.href = this.#buildFilterHref(normalizedValue);
                tag.dataset.tag = normalizedValue;
            }

            tag.textContent = label;
            return tag;
        }

        renderClearControl() {
            const clearTag = document.createElement("button");
            clearTag.classList.add("clear");
            clearTag.dataset.action = "clear";
            clearTag.href = this.#buildFilterHref("", { clear: true });
            clearTag.setAttribute("aria-label", "Clear all tags");
            clearTag.textContent = "clear";
            return clearTag;
        }

        render() {
            if (!this.isConnected) return;
            this.shadowRoot.innerHTML = "";

            if (this.#tags.length === 0) return;

            this.renderLabel();

            const tags = document.createElement("p");
            tags.classList.add("tags");
            const activeTags = this.#getActiveTags();

            this.#tags.forEach((tagLabel) => {
                const tag = this.renderTag(tagLabel);
                if (tag) tags.appendChild(tag);
            });

            if (this.linkTag && this.controls && activeTags.length > 0) {
                tags.appendChild(this.renderClearControl());
            }

            this.shadowRoot.appendChild(tags);
            this.#updateActiveTag(activeTags);
        }

        connectedCallback() {
            this.#scopeRoot = this.closest("main") ?? document;
            this.render();
            if (this.linkTag && this.controls) {
                this.shadowRoot.addEventListener("click", this.#onClickBound);
                window.addEventListener("popstate", this.#onPopStateBound);
                this.#applyFilter(this.#getActiveTags());
            }
        }

        disconnectedCallback() {
            if (this.linkTag && this.controls) {
                this.shadowRoot.removeEventListener("click", this.#onClickBound);
                window.removeEventListener("popstate", this.#onPopStateBound);
            }
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;

            if (name === "tags") {
                this.tags = newValue ?? "";
            }

            this.render();
            if (this.linkTag && this.controls && this.isConnected) {
                this.#applyFilter(this.#getActiveTags());
            }
        }

        #onClick(event) {
            const link = event.target.closest("a.tag");
            if (!link) return;
            if (link.getAttribute("aria-disabled") === "true") return;

            event.preventDefault();
            const tag = link.dataset.tag || "";
            const isClearAction = link.dataset.action === "clear";
            const nextTags = isClearAction ? [] : this.#getToggledTags(tag);

            const url = new URL(window.location.href);
            url.searchParams.delete("tag");
            nextTags.forEach(nextTag => url.searchParams.append("tag", nextTag));
            history.pushState({ tags: nextTags }, "", url);

            this.#applyFilter(nextTags);
        }

        #onPopState() {
            this.#applyFilter(this.#getActiveTags());
        }

        #applyFilter(activeTags) {
            const cards = this.#scopeRoot.querySelectorAll("a-card[data-tags]");
            cards.forEach(card => {
                if (activeTags.length === 0) {
                    card.hidden = false;
                    return;
                }

                const tags = (card.dataset.tags || "").split(",").map(t => t.trim()).filter(Boolean);
                card.hidden = !activeTags.some(tag => tags.includes(tag));
            });

            this.#scopeRoot.querySelectorAll("tag-group[filters]").forEach(group => {
                group.#updateActiveTag(activeTags);
                group.#updateAvailability(activeTags);
            });
        }

        #updateActiveTag(activeTags) {
            if (!this.shadowRoot) return;
            this.shadowRoot.querySelectorAll("a.tag").forEach(link => {
                const linkTag = link.dataset.tag || "";
                const matches = activeTags.includes(linkTag);
                link.toggleAttribute("aria-active", matches);
            });

            const clearTag = this.shadowRoot.querySelector(".clear");
            if (clearTag) {
                clearTag.toggleAttribute("aria-disabled", activeTags.length === 0);
            }
        }

        #updateAvailability(activeTags) {
            if (activeTags.length === 0) {
                this.shadowRoot.querySelectorAll("a.tag[data-tag]").forEach(link => {
                    link.setAttribute("aria-disabled", "false");
                });
                return;
            }

            const cards = [...this.#scopeRoot.querySelectorAll("a-card[data-tags]")];
            const hiddenCards = cards.filter(card => card.hidden);

            this.shadowRoot.querySelectorAll("a.tag[data-tag]").forEach(link => {
                const tag = link.dataset.tag || "";
                if (!tag || activeTags.includes(tag)) {
                    link.setAttribute("aria-disabled", "false");
                    return;
                }

                const wouldRevealResults = hiddenCards.some(card => {
                    const cardTags = (card.dataset.tags || "").split(",").map(t => t.trim()).filter(Boolean);
                    return cardTags.includes(tag);
                });

                link.setAttribute("aria-disabled", wouldRevealResults ? "false" : "true");
            });
        }
    },
);
