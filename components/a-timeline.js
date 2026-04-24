const styles = new CSSStyleSheet();
styles.replaceSync(`
	:host {
		display: block;
	}

	.timeline {
		display: flex;
		align-items: center;
	}

	.connector {
		flex: 1;
		block-size: 2px;
		background: color-mix(in srgb, var(--theme--ui--color) 90%, black);
		min-inline-size: 0.75em;

		&:first-child,
		&:last-child {
			max-inline-size: 4em;
		}
	}

	.dot {
		margin: 0.5em;

		display: block;
		inline-size: 1em;
		block-size: 1em;
		border-radius: var(--theme--BorderRadius--circle);
		background: var(--theme--ui--color);
		border: var(--theme--BorderWidth--thin) solid var(--theme--ui--color);
		transition: transform 0.2s ease, background-color 0.2s ease;

		&:not(.active) {
			cursor: pointer;
		}

		&.active {
			background: transparent;
			transform: scale(1.5);
		}

		&:not(.active):hover {
			transform: scale(1.4);
		}

		&:is(:focus, :focus-visible) {
			outline: var(--theme--BorderWidth) solid var(--theme--ui--color);
			outline-offset: var(--theme--OutlineOffset);
			border-radius: var(--theme--BorderRadius--circle);
		}
	}

	@media print {
		.timeline {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			transition: none;
		}
	}
`);

customElements.define(
	"a-timeline",
	class ATimeline extends HTMLElement {
		#activeIndex = 0;
		#dots = [];
		#keydownHandler = null;

		constructor() {
			super();
			this.attachShadow({ mode: "open" });
		}

		createConnector(index) {
			const connector = document.createElement("span");
			connector.classList.add("connector");
			connector.setAttribute("aria-hidden", "true");
			connector.dataset.index = index;
			return connector;
		}

		connectedCallback() {
			if (this.shadowRoot.firstChild) return;

			this.shadowRoot.adoptedStyleSheets = [styles];

			const panels = this.querySelectorAll(".role-panel");
			if (panels.length < 2) return;

			this.setAttribute("role", "tablist");
			this.setAttribute("aria-label", "Role history");

			const nav = document.createElement("nav");
			nav.classList.add("timeline");

			nav.appendChild(this.createConnector(-1));

			panels.forEach((panel, i) => {
				const title = panel.dataset.title || `Role ${i + 1}`;

				if (i > 0) {
					nav.appendChild(this.createConnector(i));
				}

				const dot = document.createElement("button");
				dot.classList.add("dot");
				dot.setAttribute("role", "tab");
				dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
				dot.setAttribute("tabindex", i === 0 ? "0" : "-1");
				dot.title = title;
				dot.dataset.index = i;

				dot.addEventListener("click", () => this.#activate(i));

				if (i === 0) dot.classList.add("active");

				nav.appendChild(dot);
				this.#dots.push(dot);
			});

			nav.appendChild(this.createConnector(panels.length));

			const slot = document.createElement("slot");

			this.shadowRoot.appendChild(nav);
			this.shadowRoot.appendChild(slot);

			this.#keydownHandler = (e) => {
				const current = this.#activeIndex;
				let next;

				switch (e.key) {
					case "ArrowRight":
						next = Math.min(current + 1, this.#dots.length - 1);
						break;
					case "ArrowLeft":
						next = Math.max(current - 1, 0);
						break;
					case "Home":
						next = 0;
						break;
					case "End":
						next = this.#dots.length - 1;
						break;
					default:
						return;
				}

				e.preventDefault();
				this.#dots[next].focus();
				this.#activate(next);
			};

			this.addEventListener("keydown", this.#keydownHandler);
		}

		disconnectedCallback() {
			if (this.#keydownHandler) {
				this.removeEventListener("keydown", this.#keydownHandler);
				this.#keydownHandler = null;
			}
		}

		#activate(index) {
			if (index === this.#activeIndex) return;

			const panels = this.querySelectorAll(".role-panel");
			const direction = index > this.#activeIndex ? 1 : -1;
			this.#activeIndex = index;

			this.#dots.forEach((dot, i) => {
				const isActive = i === index;
				dot.classList.toggle("active", isActive);
				dot.setAttribute("aria-selected", isActive ? "true" : "false");
				dot.setAttribute("tabindex", isActive ? "0" : "-1");
			});

			panels.forEach((panel, i) => {
				if (i === index) {
					panel.setAttribute("active", "");
					panel.style.setProperty("--slide-direction", direction);
				} else {
					panel.removeAttribute("active");
					panel.style.removeProperty("--slide-direction");
				}
			});

			const title = panels[index]?.dataset.title || "";
			this.dispatchEvent(
				new CustomEvent("role-change", {
					bubbles: true,
					detail: { index, title, direction },
				}),
			);
		}
	},
);
