jewel.game = (function() {
    var dom = jewel.dom,
        $ = dom.$;

    /* hide the active screen (if any) and show the screen
     * with the specified id */
    function showScreen(screenId) {
        var activeScreen = $("#game .screen.active")[0],
            screen = $("#" + screenId)[0];
        if (activeScreen) {
            dom.removeClass(activeScreen, "active");
        }

        if (jewel.screens[screenId]) {
            // run the screen module
            jewel.screens[screenId].run();
            // display the screen html
            dom.addClass(screen, "active");
        }
        else {
            console.error("error: no jewel.screens[" + screenId + "]")
        }
    }

    function setup() {
        // disable native touchmove behavior to 
        // prevent overscroll
        dom.bind(document, "touchmove", function(event) {
            event.preventDefault();
        });
        // hide the address bar on Android devices
        if (/Android/.test(navigator.userAgent)) {
            $("html")[0].style.height = "200%";
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 0);
        }
    }
    
    // expose public methods
    return {
        setup : setup,
        showScreen : showScreen
    };
})();
