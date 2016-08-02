(function() {

    function ready(fn) {
        if (document.readyState != "loading"){
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }


    function TabSwitcher(classPrefix) {
        this.classPrefix = classPrefix;
    }

    TabSwitcher.prototype.install = function() {
        var tabLinks = this.findTabLinks(),
            selector = "section[id^=" + this.classPrefix + "]",
            sections = document.querySelectorAll(selector);

        for (var idx = 0, length = tabLinks.length; idx < length; idx++) {
            this.installSwitcher(tabLinks[idx], tabLinks, sections);
        }
    };

    TabSwitcher.prototype.activate = function() {
        var selector = this.getClassName() + " li.is-active a",
            link = document.body.querySelector(selector);

        if (link) {
            var event = new MouseEvent("click", {
                "view": window,
                "bubbles": true,
                "cancelable": true
            });
            link.dispatchEvent(event);
        }
    };

    TabSwitcher.prototype.getClassName = function() {
        return "." + this.classPrefix;
    };

    TabSwitcher.prototype.findTabLinks = function() {
        var tabElements = document.body.querySelectorAll(this.getClassName());

        if (tabElements.length == 0 ) {
            return [];
        }

        var switcher = tabElements[0],
            tabLinks = switcher.querySelectorAll("li a[section]");

        return tabLinks;
    };

    TabSwitcher.prototype.installSwitcher = function(linkElement, links, sections) {
        var self = this,
            sectionName = linkElement.getAttribute("section"),
            sectionId = this.classPrefix + "-" + sectionName,
            sectionElement = document.getElementById(sectionId);

        linkElement.addEventListener("click", function() {
            self.toggleActiveClass(linkElement, links);
            self.toggleActiveSection(sectionElement, sections);

            return false;
        });
    };

    TabSwitcher.prototype.toggleActiveClass = function(active, links) {
        Array.prototype.forEach.call(links, function(el) {
            el.parentElement.classList.remove("is-active");
        });
        active.parentElement.classList.add("is-active");
    };

    TabSwitcher.prototype.toggleActiveSection = function(active, sections) {
        Array.prototype.forEach.call(sections, function(el) {
            el.style.display = "none";
        });
        active.style.display = "block";
    };


    ready(function () {
        var tabSwitcher = new TabSwitcher("section-tabs");

        tabSwitcher.install();
        tabSwitcher.activate();
    });

})();
