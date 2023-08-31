import "@webcomponents/webcomponentsjs/webcomponents-loader.js";

import "@patternfly/pfe-cta/dist/pfe-cta.min.js";
import "@patternfly/pfe-tabs/dist/pfe-tabs.min.js";
import "@patternfly/pfe-accordion/dist/pfe-accordion.min.js";

import "@shoelace-style/shoelace/dist/components/switch/switch.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";

const updateQuery = (params, add = true) => {
  const url = new URL(window.location);
  params.map(param => {
    if (add) url.searchParams.set(param.key, param.value);
    else url.searchParams.delete(param.key);
  });
  window.history.pushState({}, '', url);
};

const getNavHeight = () => {
  let navHeight = 0;
  const nav = document.querySelector("#nav");
  if (nav) navHeight = nav.getBoundingClientRect().height;
  return navHeight;
};

document.addEventListener("DOMContentLoaded", async () => {
  for (const link of document.querySelectorAll(".read-more")) {
    link.addEventListener("click", (evt) => {
      const el = evt.target;
      const sibling = el.parentElement.nextElementSibling;
      if (sibling && sibling.hasAttribute("hidden")) {
        sibling.removeAttribute("hidden");
        el.textContent = "Hide details";
      } else if (sibling) {
        sibling.setAttribute("hidden", "");
        el.textContent = "Read more";
      }
    });
  }

// Check for query param
  const urlParams = new URLSearchParams(window.location.search);
  const displayMode = urlParams.get("format");
  if (displayMode && displayMode.toUpperCase() === "CV") {
    document.body.classList.add("cv");
  } else {
    document.body.classList.remove("cv");
  }

  await Promise.all([
    customElements.whenDefined("pfe-accordion"),
    customElements.whenDefined("pfe-tabs"),
    customElements.whenDefined("sl-switch")
  ]);

  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches || urlParams.get("dark") === "true";
  const slSwitch = document.querySelector("sl-switch");

  // Check if the dark mode setting is set by the browser
  if (isDarkMode) {
    if (slSwitch) slSwitch.setAttribute("checked", "");
    document.body.classList.add("sl-theme-dark");
  }

  if (slSwitch) {
    slSwitch.addEventListener("sl-change", (evt) => {
      document.body.classList.toggle("sl-theme-dark", evt.target.checked);
      updateQuery([{ key: "dark", value: evt.target.checked.toString() }]);
    });
  }

  document.querySelectorAll("pfe-accordion").forEach((accordion, count) => {
    accordion.disclosure = "true";
    if (count === 0) {
      setTimeout(() => {
        accordion.expand(0);
      }, 100);
    }
  });

  const tabs = document.querySelector("pfe-tabs");
  if (tabs) {
    const shadowTabs = tabs.shadowRoot.querySelector(".tabs");
    tabs.style.alignItems = "flex-start";

    if (shadowTabs) {
      shadowTabs.style.position = "sticky";
      shadowTabs.style.top = `var(--navigation-height, ${getNavHeight()}px)`;
      shadowTabs.style.backgroundColor = "#fff";
      shadowTabs.style.zIndex = "98";
      shadowTabs.style.overflowX = "auto";
    }

    // pfe-tab:shown-tab
    document.addEventListener("pfe-tabs:shown-tab", (evt) => {
      if (!evt || !evt.detail || !evt.detail.tab) return;

      const tab = evt.detail.tab;
      const panel = tab.nextElementSibling;
      if (panel.tagName.toLowerCase() !== "pfe-tab-panel") return;

      let navHeight = getNavHeight();
      const mq = window.matchMedia("(min-width: 992px)");
      if (!mq.matches) navHeight = navHeight + tab.getBoundingClientRect().height;

      // Activate the first accordion
      const accordion = panel.querySelector("pfe-accordion");
      if (!accordion) return;

      // Scroll into view
      const elementPosition = accordion.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth"
      });

      setTimeout(() => accordion.expand(0), 200);
    });
  }

  // Update height on resize
  window.addEventListener('resize', () => {
    const tabs = document.querySelector("pfe-tabs");
    if (tabs) {
      const shadowTabs = tabs.shadowRoot.querySelector(".tabs");
      if (shadowTabs) document.body.style.setProperty("--navigation-height", `${getNavHeight()}px`);
    }
  });
});

window.addEventListener("scroll", function () {
  const nav = document.querySelector("#nav");
  if (!nav) return;

  if (window.scrollY <= 10) nav.setAttribute("color", "transparent");
  else nav.setAttribute("color", "base");
});
