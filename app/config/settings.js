/**
 * Settings Module
 * @module settings
 */

const path = require('path');

class Settings {
    /**
     * Instantiates Settings Object
     * @param {string} root - where to carry out filesystem operations from (optional)
     */
    constructor(root = null) {
        let app_dir = root || `${path.dirname(require.main.filename)}/`;
        let shots_dir = `${app_dir}screenshots/`;

        this.app_dir = `${app_dir}`;
        this.shots_dir = `${shots_dir}`;
        this.screenshot_dir = `${shots_dir}new/`;
        this.reference_dir = `${shots_dir}reference/`;
        this.output_dir = `${shots_dir}output/`;
        this.baseline_mode = false;
        this.default_config = `./app/config/websites/default`;
        this.open_output = true;
    }
}

/**
 * Changes root of application filesystem operations
 * @param {string} root
 * @returns {Settings}
 */
exports.getLocalizedSettings = (root) => {
    return new Settings(root);
};

exports.default = new Settings();