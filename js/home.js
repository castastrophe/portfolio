window.PfeConfig = {
  IconSets: [
    {
      name: "fa",
      path: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/",
      resolveIconName: (name, iconSetName, iconSetPath) => {
        const regex = new RegExp(`^${iconSetName}-(.*?)$`);
        const match = regex.exec(name);
        return iconSetPath + match[1] + ".svg"
      }
    }, {
      name: "fab",
      path: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/brands/",
      resolveIconName: (name, iconSetName, iconSetPath) => {
        const regex = new RegExp(`^${iconSetName}-(.*?)$`);
        const match = regex.exec(name);
        return iconSetPath + match[1] + ".svg"
      }
    }
  ]
};

const getNavHeight = () => {
  let navHeight = 0;
  const nav = document.querySelector("#social");
  if (nav) navHeight = nav.getBoundingClientRect().height;
  return navHeight;
};

const updateQuery = (params, add = true) => {
  const url = new URL(window.location);
  params.map(param => {
    if (add) {
      url.searchParams.set(param.key, param.value);
      if (typeof(Storage) !== "undefined") {
        window.localStorage.setItem(param.key, param.value);
      }
    }
    else {
      url.searchParams.delete(param.key);
      if (typeof(Storage) !== "undefined") {
        window.localStorage.removeItem(param.key);
      }
    }
  });

  // Update the URL history
  window.history.replaceState({}, '', url);
}

const toggleCV = (state = "toggle") => {
  document.body.classList.toggle("animating");
  // Toggle the CV class on the body
  document.body.classList[state]("cv");

  // Apply the CV query string
  if (document.body.classList.contains("cv")) {
    updateQuery([{
      key: "format",
      value: "cv"
    }]);
  } else {
    updateQuery([{
      key: "format"
    }], false);
  }

  // Reset the context on bands and cards
  document.querySelectorAll("pfe-band,pfe-card").forEach(component => component.resetContext());

  // Close the open accordions
  document.querySelectorAll("pfe-accordion").forEach(accordion => accordion.collapseAll());

  setTimeout(() => {
    document.body.classList.toggle("animating");
  }, 300);
}

document.addEventListener("DOMContentLoaded", function () {
  try {
    $('[data-popup="youtube"]').magnificPopup({
      disableOn: 600,
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false
    });

    $('.popup-link').magnificPopup({
      disableOn: 600,
      type: 'image',
      closeOnContentClick: 'true',
      zoom: {
        enabled: true,
        duration: 300,
        ease: "ease-in-out",
        opener: function (openerElement) {
          return openerElement.is('img') ? openerElement : openerElement.find('img');
        }
      }
    });
  } catch (err) {
    console.log("Magnific pop-up is not loading.")
  }
  
  Promise.all([
    customElements.whenDefined("pfe-accordion")
  ]).then(() => {
    document.querySelectorAll("pfe-accordion").forEach((accordion, count) => {
      accordion.disclosure = "true";
      if (count === 0) accordion.expand(0);

      accordion.querySelectorAll("pfe-accordion-header").forEach(header => {
        const button = header.shadowRoot.querySelector("button");
        if (button) {
          button.style.borderRightWidth = "0";
          button.style.boxShadow = "none";
        }
      });
    });
  });

  Promise.all([
    customElements.whenDefined("pfe-tabs"),
  ]).then(() => {
    let navHeight = getNavHeight();
    const tabs = document.querySelector("pfe-tabs");
    if (tabs) {
      const shadowTabs = tabs.shadowRoot.querySelector(".tabs");
      tabs.style.alignItems = "flex-start";
      if (shadowTabs) {
        shadowTabs.style.position = "sticky";

        if (navHeight) shadowTabs.style.top = `var(--navigation-height, ${navHeight}px)`;
        else  shadowTabs.style.top = `var(--navigation-height)`;

        shadowTabs.style.backgroundColor = "#fff";
        shadowTabs.style.zIndex = "98";
      }
    }
  });

  // Temporary fix: https://github.com/patternfly/patternfly-elements/pull/1697
  // Promise.all([
  //   customElements.whenDefined("pfe-band"),
  // ]).then(() => {
  //   document.querySelectorAll("pfe-band").forEach(band => {
  //     const body = band.shadowRoot.querySelector(".pfe-band__body");
  //     if (!body) return;
  //     body.style.maxWidth = "inherit";
  //   })
  // });

  // Check for query param in the URL
  const urlParams = new URLSearchParams(window.location.search);
  let displayMode = urlParams.get("format");
  
  // If the param was not found, try local storage
  if (displayMode !== "cv" && typeof(Storage) !== "undefined") {
    displayMode = window.localStorage.getItem("format");
  }

  if (displayMode === "cv") {
    toggleCV("add");
    document.querySelector("#cvToggle").checked = true;
  }
});

// Update height on resize
window.addEventListener("resize", () => {
  let navHeight = getNavHeight();
  const tabs = document.querySelector("pfe-tabs");
  if (tabs) {
    const shadowTabs = tabs.shadowRoot.querySelector(".tabs");
    if (shadowTabs) document.body.style.setProperty("--navigation-height", `${navHeight}px`);
  }
});

// If the document is scrolled past the bottom of the masthead, add the isStuck attribute 
const masthead = document.getElementById("social");
window.addEventListener("scroll", () => {
  if (document.documentElement.getBoundingClientRect().top < -1 * masthead.getBoundingClientRect().height) {
    masthead.setAttribute("isStuck", "");
  } else {
    masthead.removeAttribute("isStuck");
  }
});


// pfe-tab:shown-tab
document.addEventListener("pfe-tabs:shown-tab", evt => {
  const mq = window.matchMedia("(min-width: 992px)");
  if (evt && evt.detail && evt.detail.tab) {
    const tab = evt.detail.tab;
    const panel = tab.nextElementSibling;
    // Activate the first accordion
    const accordion = panel.querySelector("pfe-accordion");
    let navHeight = getNavHeight();
    // Scroll into view
    var elementPosition = accordion.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
    if (!mq.matches) navHeight = navHeight + tab.getBoundingClientRect().height;
    if (accordion) {
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth"
      });

      setTimeout(() => {
        accordion.expand(0);
      }, 500);
      // else accordion.collapseAll();
    }
  }
});

document.querySelectorAll(".read-more").forEach(link => {
  link.addEventListener("click", function (evt) {
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
});