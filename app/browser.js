/**
 * Browser Module
 * @module browser
 */

/* Package Dependencies */
const puppeteer = require('puppeteer');
const colors = require('colors');

/* Local Dependencies */
let filesystem = require('./filesystem');

/**
 * Crawl and Capture the Website
 * @param {Config} website
 * @param {string} website.label
 * @param {string} website.url
 * @param {Object[]} website.viewports
 * @param {Object[]} website.paths
 * @param {string[]} website.shell
 * @param {Settings} settings
 * @param {string} settings.shots_dir
 * @param {string} settings.reference_dir
 * @param {string} settings.screenshot_dir
 * @param {string} settings.output_dir
 * @param {boolean} settings.baseline_mode
 * @param {boolean} log - optional
 * @returns {Object} { warning: [], errors: [], analysis: [..] }
 */
exports.process = async (website, settings, log = true) => {

    const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: true});

    let response = {
        warnings: [],
        errors: [],
        analysis: []
    };

    /** Runs for each viewport configured */
    viewportLoop:
        for (let viewport of website.viewports) {
            let page = await browser.newPage();
            let selector = null;
            let dir = `${viewport.label}/`;

            await page.setViewport({
                width: viewport.dims[0],
                height: viewport.dims[1]
            });

            if (log)
                console.log(`\nAnalyzing ${website.label} [${viewport.label}]`.blue);

            /** Check each page configured */
            for (let path of website.paths) {
                if (log)
                    console.log(`Opening ${website.url}${path.path}`);

                try {
                    await page.goto(`${website.url}${path.path}`);
                } catch (e) {
                    response.errors.push(`Page Not Found: ${website.url}${path.path}`);
                    break viewportLoop;
                }

                try {
                    await page.waitForSelector('body', { timeout: 10000 });
                    selector = await page.$('body');
                    if (!settings.baseline_mode && !filesystem.referenceExists(website.label, path.label, `${dir}fullpage.png`, settings)) {
                        response.errors.push(`Path ${path.path} has no reference images. Please re-establish baseline images.`);
                        break viewportLoop;
                    }
                    await selector.screenshot({
                        path: `${settings.screenshot_dir}${website.label}/${path.label}/${dir}fullpage.png`
                    });
                } catch (e) {
                    response.errors.push("Page did not load." + `${e}`);
                    break viewportLoop;
                }

                if (path.shell) {
                    if (log)
                        console.log("\tCapturing Shell Elements...".blue);

                    for (let element of website.shell) {
                        try {
                            await page.waitForSelector(element, { timeout: 10000 });
                            selector = await page.$(element);
                            await selector.screenshot({
                                path: `${settings.screenshot_dir}${website.label}/${path.label}/${dir}${element.replace(/\s\./g,'_')}.png`
                            });
                            response.analysis.push({
                                website: website.label,
                                path: path.label,
                                viewport: viewport.label,
                                image: `${dir}${element.replace(/\s\./g,'_')}.png`
                            })
                        } catch (e) {
                            if (e.name == "TimeoutError") {
                                response.warnings.push({
                                    message: `Selector "${element}" is null.`,
                                    path: `${viewport.label}: ${path.label}`
                                });
                            } else {
                                if (e.message.match("not visible")) {
                                    response.warnings.push({
                                        message: `Selector "${element}" is likely not visible.`,
                                        path: `${viewport.label}: ${path.label}`
                                    });
                                } else {
                                    response.errors.push(`${e}`);
                                    break viewportLoop;
                                }
                            }
                        }
                    }
                }

                if (path.elements) {
                    if (log)
                        console.log("\tCapturing Page Elements...".blue);

                    for (let element of path.elements) {
                        try {
                            await page.waitForSelector(element, { timeout: 10000 });
                            selector = await page.$(element);
                            await selector.screenshot({
                                path: `${settings.screenshot_dir}${website.label}/${path.label}/${dir}${element.replace(/\s\./g,'_')}.png`
                            });
                            response.analysis.push({
                                website: website.label,
                                path: path.label,
                                viewport: viewport.label,
                                image: `${dir}${element.replace(/\s\./g, '_')}.png`
                            })
                        } catch (e) {
                            if (e.name == "TimeoutError") {
                                response.warnings.push({
                                    message: `Selector "${element}" is null.`,
                                    path: `${viewport.label}: ${path.label}`
                                });
                            } else {
                                if (e.message.match("not visible")) {
                                    response.warnings.push({
                                        message: `Selector "${element}" is likely not visible.`,
                                        path: `${viewport.label}: ${path.label}`
                                    });
                                } else {
                                    response.errors.push(`${e}`);
                                    break viewportLoop;
                                }
                            }
                        }
                    }
                }
            }
        }

    await browser.close();

    if (log)
        console.log("\nCapturing complete.\n".green);

    if (settings.baseline_mode) {
        if (log)
            console.log("\nEstablishing baseline images...".blue);

        let baselineImages = await filesystem.copyToBaseline(website.label, settings);
        if (!baselineImages)
            response.errors.push("Failed to create baseline images.\n");
        else
            if (log) console.log("\n\nComplete.\n".blue);
    }

    return response;
};

/**
 * Validates website configuration
 * @param {Object} website
 * @param {string} website.label
 * @param {string} website.url
 * @param {Object[]} website.viewports
 * @param {Object[]} website.paths
 * @param {Object[]} website.shell
 * @returns {boolean}
 */
exports.validate = (website) => {
    if (typeof website != "object")
        return false;

    try {
        if (!website.url) return false;
        if (!website.label) return false;
        if (!website.shell) return false;
        if (!website.paths) return false;
        if (!website.paths.length) return false;
        if (!website.viewports) return false;
        if (!website.viewports.length) return false;
    } catch (e) {
        return false;
    }

    for (let viewport of website.viewports) {
        if (typeof viewport.label != "string") return false;
        if (!viewport.dims.length === 2) return false;
        if (isNaN(viewport.dims[0]) || isNaN(viewport.dims[1])) return false;
    }

    for (let path of website.paths) {
        if (typeof path.path == "undefined") return false;
        if (path.elements && path.elements.length) {
            for (let element of path.elements) {
                if (typeof element != "string") {
                    return false;
                }
            }
        }
    }

    return website;
};