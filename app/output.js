/**
 * Output Module
 * @module output
 */

/* Local Dependencies */
let filesystem = require('./filesystem');


/**
 * Prepares output directory and input data
 * @param {Object[]} diffs
 * @param {string} website
 * @param {Settings} settings
 * @param {string} settings.reference_dir
 * @param {string} settings.screenshot_dir
 * @param {string} settings.output_dir
 * @returns {Object[]} [{path: "path", reference: "path/fullpage_ref.png", screenshot: "path/fullpage.png"},...]
 */
exports.prepareOutput = async (diffs, website, settings) => {

    let fullpageDiffs = [];
    let paths = exports.extractDiffPaths(diffs);

    for (let path of paths) {
        await filesystem.copyToOutput(website, path, settings);
        fullpageDiffs.push({
            path: path,
            reference: `${path}/fullpage_ref.png`,
            screenshot: `${path}/fullpage.png`
        });
    }

    return fullpageDiffs;
};

/**
 * Prepares output page html
 * @param {Object[]} diffs
 * @param {Settings} settings
 * @param {string} settings.app_dir
 * @returns {Promise<string>} rendered html
 */
exports.generateHtml = async (diffs) => {

    let page_tmpl = filesystem.getTemplate('output');
    let switcher_tmpl = filesystem.getTemplate('snippets/switcher');
    let button_tmpl = '<button class="{activate}" data-target-id="{path}">{path}</button>';
    let title = `Test Output: ${new Date().toDateString()}`;
    let activate = "active";

    let tabs = "";
    for (let diff of diffs) {
        tabs += exports.render(button_tmpl, {
            path: diff.path,
            activate: activate
        });
        activate = "";
    }

    let switchers = "";
    for (let diff of diffs) {
        switchers += exports.render(switcher_tmpl, {
            reference: diff.reference,
            new: diff.screenshot,
            path: diff.path
        });
    }

    return exports.render(page_tmpl, {
        title: title,
        tabs:  tabs,
        switchers: switchers
    });
};

/**
 * Returns reorganized collection of diffs by path since we are using 1 fullpage shot for each path
 * @param {Object[]} diffs
 * @param {Object} diffs[].case
 * @param {string} diffs[].case.path
 * @param {string} diffs[].case.viewport
 * @returns {Object[]} ["path/viewport/",...]
 */
exports.extractDiffPaths = (diffs) => {

    let paths = [];
    for (diff of diffs) {
        let path = `${diff.case.path}/${diff.case.viewport}`;
        if (!paths.includes(path)) {
            paths.push(path);
        }
    }

    return paths;
};

/**
 * Replaces template vars with values
 * @param {string} template
 * @param {Object} vars - any amount of key/value pairs as object
 * @returns {string} rendered html
 */
exports.render = (template, vars) => {

    let tmpl = template;
    let tmpl_vars = Object.entries(vars);

    for (let pair of tmpl_vars) {
        let variable = `{${pair[0]}}`;
        let regex = new RegExp(variable,"g");
        tmpl = tmpl.replace(regex,pair[1]);
    }

    return tmpl;
};