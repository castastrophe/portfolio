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
});

window.addEventListener("scroll", function () {
  const nav = document.querySelector("#nav");
  if (!nav) return;

  if (window.scrollY <= 10) nav.setAttribute("color", "transparent");
  else nav.setAttribute("color", "base");
});
