document.addEventListener("DOMContentLoaded", function () {
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
});

document.addEventListener('DOMContentLoaded', function(event) {
  Promise.all([
    customElements.whenDefined("pfe-accordion"),
    customElements.whenDefined("pfe-tabs")
  ]).then(function() {
    document.querySelectorAll("pfe-accordion").forEach(function(accordion, count) {
      accordion.disclosure = "true";
      if (count === 0) accordion.expand(0);

      accordion.querySelectorAll("pfe-accordion-header").forEach(function(header, idx) {
        var button = header.shadowRoot.querySelector("button");
        if (button) {
          button.style.borderRightWidth = "0";
          button.style.boxShadow = "none";
        }
      });
    });

    var tabs = document.querySelector("pfe-tabs");
    if (tabs) {
      var shadowTabs = tabs.shadowRoot.querySelector(".tabs");
      tabs.style.alignItems = "flex-start";
      if (shadowTabs) {
        shadowTabs.style.position = "sticky";
        shadowTabs.style.top = "75px";
      }
    }
  });
});

// pfe-tab:shown-tab
document.addEventListener("pfe-tabs:shown-tab", function (evt) {
  if (evt && evt.detail && evt.detail.tab) {
    var tab = evt.detail.tab;
    var panel = tab.nextElementSibling;
    // Activate the first accordion
    var accordion = panel.querySelector("pfe-accordion");
    if (accordion) setTimeout(accordion.expand(0), 500);
  }
});

document.querySelectorAll(".read-more").forEach(function(link) {
  link.addEventListener("click", function (evt) {
    var el = evt.target;
    var sibling = el.parentElement.nextElementSibling;
    if (sibling && sibling.hasAttribute("hidden")) {
      sibling.removeAttribute("hidden");
      el.textContent = "Hide details";
    } else if (sibling) {
      sibling.setAttribute("hidden", "");
      el.textContent = "Read more";
    }
  });
});