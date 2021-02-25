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
