/**
 * Config Module
 * @module config
 */

class Path {
    /**
     * Instantiates Path object
     * @param {string} label
     * @param {string} path
     * @param {boolean|string} shell - true,false,{viewport label}
     * @param {string[]} elements - css selectors
     * @param {Trigger[]} triggers
     */
    constructor(label, path, shell, elements, triggers) {
        this.label = label;
        this.path = path;
        this.shell = true;
        this.elements = elements;
        this.triggers = triggers;
    }
}

class Viewport {
    /**
     * Instantiates Viewport object
     * @param {string} label
     * @param {number} width
     * @param {number} height
     */
    constructor(label, width, height) {
        this.label = label;
        this.dims = [width, height]
    }
}

class Trigger {
    /**
     * Interaction Instructions
     * @param {string} event - "hover","focus","tap","click"
     * @param {string} selector - css selector
     * @param {string} when - "pre","post"
     * @param {number} wait - delay before capture (optional)
     */
    constructor(event, selector, when, capture = true, wait = 200) {
        this.selector = selector;
        this.event = event;
        this.when = when;
        this.wait = wait;
        this.capture = true;
    }
}


class Config {
    /**
     * Instantiates Config object
     * @param {string} label
     * @param {string} url
     * @param {Viewport[]} viewports
     * @param {Path[]} paths
     * @param {string[]} shell - css selectors
     */
    constructor(label, url, viewports, paths, shell) {
        this.label = label;
        this.url = url;
        this.viewports = viewports;
        this.paths = paths;
        this.shell = shell;
    }
}

/**
 * Returns new Viewport object.
 * @param {string} label
 * @param {number} width
 * @param {number} height
 * @returns {Viewport}
 */
exports.viewport = function (label, width, height) {
    return new Viewport(label,width,height);
};

/**
 * Returns new Path object.
 * @param {string} label
 * @param {string} path
 * @param {boolean|string} shell - true,false,{viewport label}
 * @param {string[]} elements - css selectors
 * @param {Trigger[]} triggers (optional)
 * @returns {Path}
 */
exports.path = function (label, path, shell, elements, triggers = []) {
    return new Path(label,path,shell,elements,triggers);
};

/**
 * Returns new Trigger object
 * @param {string} event - "hover","focus","tap","click"
 * @param {string} selector - css selector
 * @param {string} when - "pre","post"
 * @param {number} wait - delay before capture (optional)
 */
exports.trigger = (event, selector, when, wait = 200) => {
    return new Trigger(event, selector, when, wait)
};

/**
 * Return custom configuration, all params required.
 * @param {string} label
 * @param {string} url
 * @param {Viewport[]} viewports
 * @param {Path[]} paths
 * @param {string[]} shell - css selectors
 * @returns {Config}
 */
exports.custom = function(label, url, viewports, paths, shell) {
    return new Config(label, url, viewports, paths, shell);
};

exports.default = new Config(
    "google", // label
    "https://about.google/", // url
    [
        // viewports (required 1+)
        new Viewport("desktop",1920,1080),
        new Viewport("mobile",375,812)
    ],
    [
        // paths (required 1+)
        new Path(
            "homepage",     // label
            "intl/en/",     // path
            true,           // capture shell elements
            [
                // page elements to capture css selectors
                ".home-hero-copy",
                '.carousel-placeholder'
            ],
            [
                // events to trigger and capture on page
                new Trigger(
                    'hover', // event (hover,click,tap,focus)
                    '.carousel-placeholder', // css selector for target element
                    'pre' // when to capture, before or after main captures ("pre" or "post")
                )
            ]
        )
    ],
    [
        // site shell element css selectors (elements on all pages)
        "header",
        "footer"
    ]
);
