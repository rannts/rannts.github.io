(function() {

    var ACTIVE_CLASS = "is-active";

    function ready(fn) {
        if (document.readyState != "loading"){
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }


    function install_nav_toggle(toggle_id, menu_id) {
        var toggle = document.getElementById(toggle_id),
            menu = document.getElementById(menu_id);

        toggle.addEventListener("click", function() {
            toggle.classList.toggle(ACTIVE_CLASS);
            menu.classList.toggle(ACTIVE_CLASS);
        });
    }


    ready(function () {
        install_nav_toggle("nav-toggle", "nav-menu");
    });

})();
