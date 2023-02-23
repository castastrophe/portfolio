const updateQuery = (params, add = true) => {
  const url = new URL(window.location);
  params.map((param) => {
    if (add) url.searchParams.set(param.key, param.value);
    else url.searchParams.delete(param.key);
  });
  window.history.pushState({}, "", url);
};

// const getNavHeight = () => {
//   let navHeight = 0;
//   const nav = document.querySelector("#nav");
//   if (nav) navHeight = nav.getBoundingClientRect().height;
//   return navHeight;
// };

// Check for query param
const urlParams = new URLSearchParams(window.location.search);
const displayMode = urlParams.get("format");

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

  await Promise.all([
    customElements.whenDefined("sl-details"),
    // customElements.whenDefined("sl-tab-group"),
    customElements.whenDefined("sl-switch"),
  ]);

  const slSwitch = document.querySelector("sl-switch");
  if (slSwitch) {
    if (displayMode === "cv") {
      slSwitch.setAttribute("checked", "");
      document.body.classList.add("cv");
    } else {
      slSwitch.removeAttribute("checked");
      document.body.classList.remove("cv");
    }

    slSwitch.addEventListener("sl-change", () => {
      // Toggle the CV class on the body
      document.body.classList.toggle("cv");

      // Apply the CV query string
      if (document.body.classList.contains("cv"))
        updateQuery([
          {
            key: "format",
            value: "cv",
          },
        ]);
      else
        updateQuery(
          [
            {
              key: "format",
            },
          ],
          false
        );
    });
  }

  document.querySelectorAll("sl-details").forEach((detail, count) => {
    if (count >= 2) {
      setTimeout(() => {
        detail.show();
      }, 100);
    }
  });
});

window.addEventListener("scroll", function () {
  const nav = document.querySelector("#nav");
  if (!nav) return;

  if (window.scrollY > 0) nav.removeAttribute("color");
  else nav.setAttribute("color", "transparent");
});
