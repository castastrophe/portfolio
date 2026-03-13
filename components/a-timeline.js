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
		background: color-mix(in srgb, var(--theme--ui--Color--accent) 90%, black);
		min-inline-size: 0.75rem;

		&:first-child,
		&:last-child {
			max-inline-size: 4rem;
		}
	}

	.dot {
		margin: 0.5rem;

		display: block;
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: var(--theme--BorderRadius--circle);
		background: var(--theme--ui--Color--accent);
		border: var(--theme--BorderWidth--thin) solid var(--theme--ui--Color--accent);
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
			outline: var(--theme--BorderWidth) solid var(--theme--ui--Color--accent);
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
			this.shadowRoot.adoptedStyleSheets = [styles];

			const panels = this.querySelectorAll(".role-panel");
			if (panels.length < 2) return;

			this.setAttribute("role", "tablist");
			this.setAttribute("aria-label", "Role history");

			// Build timeline navigation
			const nav = document.createElement("nav");
			nav.classList.add("timeline");

			const preconnector = this.createConnector(-1);
			nav.appendChild(preconnector);

			panels.forEach((panel, i) => {
				const title = panel.dataset.title || `Role ${i + 1}`;

				if (i > 0) {
					const connector = this.createConnector(i);
					nav.appendChild(connector);
				}

				const dot = document.createElement("button");
				dot.classList.add("dot");
				dot.setAttribute("role", "tab");
				dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
				dot.setAttribute("tabindex", i === 0 ? "0" : "-1");
				dot.title = title;
				dot.dataset.index = i;

				// Click handler
				dot.addEventListener("click", (e) => {
					this.#activate(Number(i));
				});

				if (i === 0) dot.classList.add("active");

				nav.appendChild(dot);
				this.#dots.push(dot);
			});

			const postconnector = this.createConnector(panels.length);
			nav.appendChild(postconnector);

			const slot = document.createElement("slot");

			this.shadowRoot.appendChild(nav);
			this.shadowRoot.appendChild(slot);

			// Keyboard navigation (roving tabindex)
			this.addEventListener("keydown", (e) => {
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
			});
		}

		#activate(index) {
			if (index === this.#activeIndex) return;

			const panels = this.querySelectorAll(".role-panel");
			const direction = index > this.#activeIndex ? 1 : -1;
			this.#activeIndex = index;

			// Update dots
			this.#dots.forEach((dot, i) => {
				const isActive = i === index;
				dot.classList.toggle("active", isActive);
				dot.setAttribute("aria-selected", isActive ? "true" : "false");
				dot.setAttribute("tabindex", isActive ? "0" : "-1");
			});

			// Update panels
			panels.forEach((panel, i) => {
				if (i === index) {
					panel.setAttribute("active", "");
					panel.style.setProperty("--slide-direction", direction);
				} else {
					panel.removeAttribute("active");
					panel.style.removeProperty("--slide-direction");
				}
			});

			// Dispatch event for header title update
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
