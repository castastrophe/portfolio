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

var blobContainer = document.getElementById("maska");
var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
group.classList = "blobs";

for (var index = 0; index < 10; index++) {
  var blob = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  blob.classList = "blob";
  blob.setAttribute("cx", Math.floor((Math.random() * window.innerWidth) + 1));
  blob.setAttribute("cy", Math.floor((Math.random() * window.innerWidth) + 1));
  blob.setAttribute("r", Math.floor((Math.random() * 100) + 40));
  blob.setAttribute("transform", "rotate(0) translate(0, 0) rotate(0)");
  group.appendChild(blob);
}

blobContainer.appendChild(group);

var radius = Math.floor((Math.random() * 100) + 40);
TweenMax.staggerFromTo('.blob', 20, {
  cycle: {
    attr: function (i) {
      var r = i * 90;
      return {
        transform: 'rotate(' + r + ') translate(' + radius + ',0.1) rotate(' + (-r) + ')'
      }
    }
  }
}, {
  cycle: {
    attr: function (i) {
      var r = i * 90 + 360;
      return {
        transform: 'rotate(' + r + ') translate(' + radius + ',0.1) rotate(' + (-r) + ')'
      }
    }
  },
  ease: Linear.easeNone,
  repeat: -1
});
// });