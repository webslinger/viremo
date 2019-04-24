/**
 * Config Module
 * @module config
 */

class Path {
    /**
     * Instantiates Path object
     * @param {string} label
     * @param {string} path
     * @param {boolean} shell
     * @param {string[]} elements
     */
    constructor(label, path, shell, elements) {
        this.label = label;
        this.path = path;
        this.shell = true;
        this.elements = elements;
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

class Config {
    /**
     * Instantiates Config object
     * @param {string} label
     * @param {string} url
     * @param {Viewport[]} viewports
     * @param {Path[]} paths
     * @param {boolean} shell
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
 * @param {boolean} shell
 * @param {string[]} elements
 * @returns {Path}
 */
exports.path = function (label, path, shell, elements) {
    return new Path(label,path,shell,elements);
};

/**
 * Return custom configuration, all params required.
 * @param {string} label
 * @param {string} url
 * @param {Object[]} viewports
 * @param {Object[]} paths
 * @param {Object[]} shell
 * @returns {Config}
 */
exports.custom = function(label, url, viewports, paths, shell) {
    return new Config(label, url, viewports, paths, shell);
};

exports.default = new Config(
    "google",
    "https://about.google/",
    [
        new Viewport("desktop",1920,1080),
        new Viewport("mobile",375,812)
    ],
    [
        new Path("homepage", "intl/en/", true, [".home-hero-copy"])
    ],
    [
        "header",
        "footer"
    ]
);
