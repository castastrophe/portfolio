// Theme Toggle for Cards
var themeToggle = function( target, type, event ) {
    var $target = $( target ),
        attr     = "data-" + type,
        selector = "data-" + type + "-" + event,
        currentType = $target.attr( attr ),
        newType = $target.attr( selector );

    $target.attr( attr, newType );
    $target.attr( selector, currentType );
};

$.each( [ "theme", "background" ], function( idx, type ) {
    $( "[data-" + type + "-hover]" ).hover( function() {
        themeToggle( this, type, "hover" );
    } );

    $( "[data-" + type + "-click]" ).click( function() {
        themeToggle( this, type, "click" );
    } );
} );
