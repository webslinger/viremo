/**
 * File System Module
 * @module filesystem
 */

/* Package Dependencies */
const fs = require('fs-extra');
const path = require('path');

/**
 * Geneerates support folders for website configuration
 * @param {Object} website
 * @param {string} website.label
 * @param {Object[]} website.paths
 * @param {Object[]} website.viewports
 * @param {Settings} settings
 * @param {string} settings.shots_dir
 * @param {string} settings.reference_dir
 * @param {string} settings.screenshot_dir
 * @param {string} settings.output_dir
 * @param {boolean} settings.baseline_mode
 * @returns {boolean}
 */
exports.init = (website, settings) => {
    try {
        if (!fs.existsSync(settings.shots_dir))
            fs.mkdirSync(settings.shots_dir);

        if (!fs.existsSync(settings.screenshot_dir))
            fs.mkdirSync(settings.screenshot_dir);

        if (!fs.existsSync(settings.reference_dir))
            fs.mkdirSync(settings.reference_dir);

        if (!fs.existsSync(settings.output_dir))
            fs.mkdirSync(settings.output_dir);

        if (!fs.existsSync(`${settings.screenshot_dir}${website.label}`))
            fs.mkdirSync(`${settings.screenshot_dir}${website.label}`);

        if (settings.baseline_mode)
            if (fs.existsSync(`${settings.reference_dir}${website.label}`))
                fs.emptyDir(`${settings.reference_dir}${website.label}`)

        for (let path of website.paths) {
            if (!fs.existsSync(`${settings.screenshot_dir}${website.label}/${path.label}`)) {
                fs.mkdirSync(`${settings.screenshot_dir}${website.label}/${path.label}`);
                for (let viewport of website.viewports) {
                    if (!fs.existsSync(`${settings.screenshot_dir}${website.label}/${path.label}/${viewport.label}`)) {
                        fs.mkdirSync(`${settings.screenshot_dir}${website.label}/${path.label}/${viewport.label}`);
                    } else {
                        fs.emptyDir(`${settings.screenshot_dir}${website.label}/${path.label}/${viewport.label}`);
                    }
                }
            }
        }
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Checks if reference images exist
 * @param {string} website
 * @param {string} path
 * @param {string} file
 * @param {Settings} settings
 * @param {string} settings.reference_dir
 * @returns {boolean}
 */
exports.referenceExists = (website, path, file, settings) => {
    return fs.existsSync(`${settings.reference_dir}${website}/${path}/${file}`);
};

/**
 * Copies screenshots to references folder.
 * @param {string} website
 * @param {Settings} settings
 * @param {string} settings.screenshot_dir
 * @param {string} settings.reference_dir
 * @returns {Promise<boolean>}
 */
exports.copyToBaseline = async (website, settings) => {
    await fs.copy(`${settings.screenshot_dir}${website}`, `${settings.reference_dir}${website}`);
    return !!(fs.existsSync(`${settings.reference_dir}${website}`));
};

/**
 * Copies fullpage screenshots to output directory
 * @param {string} website
 * @param {string} path
 * @param {Settings} settings
 * @param {string} settings.reference_dir
 * @param {string} settings.screenshot_dir
 * @param {string} settings.output_dir
 * @returns {Promise<boolean>}
 */
exports.copyToOutput = async (website, path, settings) => {
    let reference = `${settings.reference_dir}${website}/${path}/fullpage.png`;
    let screenshot = `${settings.screenshot_dir}${website}/${path}/fullpage.png`;

    await fs.copy(reference, `${settings.output_dir}${path}/fullpage_ref.png`);
    await fs.copy(screenshot, `${settings.output_dir}${path}/fullpage.png`);

    if (!fs.existsSync(`${settings.output_dir}${path}/fullpage.png`))
        return false;
    else if (!fs.existsSync(`${settings.output_dir}${path}/fullpage_ref.png`))
        return false;
    return true;
};

/**
 * Empties a directory
 * @param {string} dir
 * @returns {Promise<void>}
 */
exports.emptyDirectory = async (dir) => {
    await fs.emptyDir(dir);
};

/**
 * Returns utf8 string of template
 * @param {string} template
 * @param {Settings} settings
 * @param {string} settings.app_dir
 * @returns {string} html as utf8 string
 */
exports.getTemplate = (template) => {
    return fs.readFileSync(`${process.cwd()}/app/config/templates/${template}.html`, 'utf8');
};

/**
 * Writes html file to output directory
 * @param {string} response
 * @param {Settings} settings
 * @param {string} settings.output_dir
 */
exports.saveOutput = (response, settings) => {
    fs.writeFileSync(`${settings.output_dir}output.html`, response, (err) => {
        if (err) throw err;
    });
};