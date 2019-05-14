/**
 * Browser Module
 * @module browser
 */

/* Package Dependencies */
const puppeteer = require('puppeteer');
const colors = require('colors');

/* Local Dependencies */
const filesystem = require('./filesystem');

/* Local Methods & Properties */
function step(message) {
    if (log)
        console.log(`${message}`.blue);
}
function detail(message) {
    if (log)
        console.log(message);
}

let response = {
    warnings: [],
    errors: [],
    analysis: []
};
let log = true;

class TestCase {
    constructor(website,path,viewport,image) {
        this.website = website;
        this.path = path;
        this.viewport = viewport;
        this.image = `${image}.png`;
    }
}

/**
 * Validates website configuration
 * @param {Config} website
 * @returns {boolean}
 */
exports.validate = (website) => {
    if (typeof website !== "object")
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
        if (viewport.__proto__.constructor.name !== "Viewport")
            return false;
    }

    return true;
};

/**
 * Gets new page, sets dimensions, and returns page.
 * @param {Browser} browser
 * @param {Viewport} viewport
 * @returns {Promise<Page>}
 */
exports.newPage = async (browser, viewport) => {
    let page = await browser.newPage();
    await page.setViewport({
        width: viewport.dims[0],
        height: viewport.dims[1]
    });
    return page;
};

/**
 * Navigates browser to given page and waits for network idle.
 * @param {string} path
 * @param {Page} page
 * @returns {Promise<boolean>}
 */
exports.gotoPath = async (path, page) => {
    try {
        await page.goto(path, { waitUntil: 'networkidle0'});
    } catch (e) {
        response.errors.push(`Page Not Found: ${path}`);
        return false;
    }
    return true;
};

/**
 * Confirms that baseline images exist to compare to
 * @param {string} website (label)
 * @param {string} path (label)
 * @param {string} viewport (label)
 * @param {Settings} settings
 * @returns {boolean}
 */
exports.confirmBaselines = (website, path, viewport, settings) => {
    if (settings.baseline_mode)
        return true;

    if (filesystem.referenceExists(
        website,
        path,
        viewport,
        settings
    )) {
        return true;
    }
    if (response)
        response.errors.push(`Path ${path} has no reference images. Please re-establish baseline images.`);
    return false;
};

/**
 * Performs configured events
 * @param {Trigger[]} triggers
 * @param {string} when
 * @param {Page} page
 * @param {string} website
 * @param {string} path
 * @param {string} viewport
 * @param {Settings} settings
 * @returns {boolean|Promise<Object>}
 */
exports.triggerEvents = (triggers, when, page, website, path, viewport, settings) => {
    if (!triggers.length) {
        return false;
    }

    return new Promise((resolve, reject) => {
        let count = 0;
        let response = {
            warnings: [],
            captures: []
        };
        let waiting = false;

        for (let trigger of triggers) {
            if (trigger.when === when) {
                waiting = true;
                page[trigger.event](trigger.selector)
                    .then(async () => {
                        count++;
                        if (trigger.capture) {
                            await exports.captureSelector(trigger.selector, website, path, viewport, settings,page,trigger.event);
                        }
                        if (count === triggers.length) {
                            if (response.warnings.length) {
                                resolve(response);
                            }
                            resolve(true);
                        }
                    })
                    .catch((err) => {
                        count++;
                        response.warnings.push(err);
                        if (count === triggers.length)
                            resolve(response);
                    });
            } else {
                count++;
            }
        }
        if (!waiting) {
            resolve(true);
        }
    });
};

/**
 * Selects and captures screen shot of provided css selector
 * @param {string} element (css selector)
 * @param {string} website (label)
 * @param {string} path (label)
 * @param {string} viewport (label)
 * @param {Settings} settings
 * @param {Page} page
 * @param {string|boolean} event
 * @returns {Promise<boolean>|Object}
 */
exports.captureSelector = async (element, website, path, viewport, settings, page, event = false) => {
    let target_dir = (settings.baseline_mode) ? settings.reference_dir : settings.capture_dir;
    try {
        await page.waitForSelector(element, { timeout: 10000 });
        let selector = await page.$(element);
        let selectorFilename = element.replace(/\s/g,'_');
        if (event) {
            selectorFilename += `:${event}`;
        }
        await selector.screenshot({
            path: `${target_dir}${website}/${path}/${viewport}/${selectorFilename}.png`
        });
        if (response) {
            response.analysis.push(new TestCase(website,path,viewport,selectorFilename));
        }
        return true;
    } catch (e) {
        if (e.name === "TimeoutError") {
            response.warnings.push({
                message: `Selector "${element}" is null.`,
                path: `${viewport}: ${path}`
            });
            return response.warnings;
        } else {
            if (e.message.match("not visible")) {
                response.warnings.push({
                    message: `Selector "${element}" is likely not visible.`,
                    path: `${viewport}: ${path}`
                });
                return response.warnings;
            } else {
                response.errors.push(`${e}`);
                return response.errors;
            }
        }
    }
};

/**
 * Captures full page
 * @param {string} website
 * @param {string} path
 * @param {string} viewport
 * @param {Settings} settings
 * @param {Object} page
 * @returns {Promise<Buffer>|boolean}
 */
exports.captureFullpage = async (website, path, viewport, settings, page) => {
    try {
        let target_dir = (settings.baseline_mode) ? settings.reference_dir : settings.capture_dir;
        let selector = await page.$('body');
        let result = await selector.screenshot({
            path: `${target_dir}${website}/${path}/${viewport}/fullpage.png`
        });
        return result;
    } catch (e) {
        return false;
    }
};

/**
 * Crawl and Capture the Website
 * @param {Config} website
 * @param {Settings} settings
 * @param {boolean} output_logs (optional)
 * @returns {Object}
 */
exports.process = async (website, settings, output_logs = true) => {
    log = output_logs;
    let browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless: settings.headless});

    filesystem.init(website,settings);

    /** Runs for each viewport configured */
    viewportLoop:
        for (let viewport of website.viewports) {
            let page = await exports.newPage(browser, viewport);

            step(`\nAnalyzing ${website.label} [${viewport.label}]`);
            /** Check each page configured */
            for (let path of website.paths) {

                /** Confirm there are baseline images (if not in baseline mode) */
                if (exports.confirmBaselines(website.label, path.label, viewport.label, settings) === false)
                    break viewportLoop;

                /** Navigate to path */
                detail(`Opening ${website.url}${path.path}`);
                let navigation = await exports.gotoPath(`${website.url}${path.path}`, page);
                if (!navigation)
                    break viewportLoop;

                /** Capture pre-capture events */
                detail(`\tChecking for pre-screenshot events.`);
                await exports.triggerEvents(path.triggers, "pre",page,website.label,path.label,viewport.label,settings);

                /** Select and capture shell elements */
                if (path.shell === true) {
                    detail("\tCapturing Shell Elements...");
                    for (let element of website.shell) {
                        await exports.captureSelector(element, website.label, path.label, viewport.label, settings, page);
                        if (response.errors.length)
                            break viewportLoop;
                    }
                }

                /** Select and capture page elements */
                if (path.elements.length) {
                    detail("\tCapturing Page Elements...");
                    for (let element of path.elements) {
                        await exports.captureSelector(element, website.label, path.label, viewport.label, settings, page);
                        if (response.errors.length)
                            break viewportLoop;
                    }
                }

                /** Capture fullpage */
                await exports.captureFullpage(website.label,path.label,viewport.label,settings,page);

                /** Capture post-capture events */
                detail(`\tChecking for post-screenshot events.`);
                await exports.triggerEvents(path.triggers, "post",page,website.label,path.label,viewport.label,settings);
            }
        }

    await browser.close();


    if (log && !response.errors.length)
        console.log("\nCapturing complete.\n".green);

    return response;
};