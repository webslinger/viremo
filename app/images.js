/**
 * Images Module
 * @module images
 */

/* Package Dependences */
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const looksSame = require('looks-same');


/**
 * Optimizes images in the given path.
 * @param {string} path
 * @returns {Promise<void>}
 */
let optimize = async (path) => {
    return await imagemin([path], {
        plugins: [
            imageminPngquant({
                strip: true,
                quality: [0.6,0.8]
            })
        ]
    });
};

/**
 * Optimizes reference images.
 * @param {string} website
 * @param {Settings} settings
 * @param {string} settings.reference_dir
 * @returns {Promise<boolean>}
 */
exports.optimizeReferences = async (website, settings) => {
    if (!website || !settings.screenshot_dir)
        return false;

    let optimized = await optimize(`${settings.reference_dir}${website}/**/*.png`);

    return !!optimized;
};

/**
 * Optimizes new images.
 * @param {string} website
 * @param {Settings} settings
 * @param {string} settings.screenshot_dir
 * @returns {Promise<boolean>}
 */
exports.optimizeScreenshots = async (website, settings) => {
    if (!website || !settings.screenshot_dir)
        return false;

    let optimized = await optimize(`${settings.screenshot_dir}${website}/**/*.png`);

    return !!optimized;
};

/**
 * Compares reference to new images to detect differences
 * @param {Object[]} analysis
 * @param {string} analysis[].image
 * @param {string} analysis[].path
 * @param {string} analysis[].viewport
 * @param {string} analysis[].website
 * @param {Settings} settings
 * @param {string} settings.screenshot_dir
 * @param {string} settings.reference_dir
 * @returns {Promise<Object[]>} Array of diffs
 */
exports.analyze = (analysis, settings) => {
    return new Promise((resolve, reject) => {
        if ((!analysis || !analysis.length) || typeof analysis !== "object")
            reject(false);

        let diffs = [];
        let count = 0;

        for (let test_case of analysis) {
            let full_path = `${test_case.website}/${test_case.path}/${test_case.image}`;
            try {
                looksSame(`${settings.screenshot_dir}${full_path}`, `${settings.reference_dir}${full_path}`, function(error, {equal}) {
                    if (error)
                        throw error;

                    let result = {equal};
                    if (!result.equal) {
                        diffs.push({
                            case: test_case,
                            path: full_path
                        });
                    }
                    count++;
                    if (count === analysis.length) {
                        resolve(diffs);
                    }
                });
            } catch (e) {
                reject('An error occurred during comparison.');
            }
        }

    });
};