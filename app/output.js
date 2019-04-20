const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const colors = require('colors');
const imageDataUri = require('image-data-uri');

// modules
let config = require('../config/settings.js');

module.exports = {
    generateOutput: async (diffs) => {
        let encodedDiffs = [];
        for (let path of diffs.paths) {
            let reference = `${config.app_dir}/${config.reference_dir}${diffs.website}/${path}/fullpage.png`;
            let screenshot = `${config.app_dir}/${config.screenshot_dir}${diffs.website}/${path}/fullpage.png`;
            fs.copy(reference, `${config.app_dir}/${config.output_dir}${path}/fullpage_ref.png`);
            fs.copy(screenshot, `${config.app_dir}/${config.output_dir}${path}/fullpage.png`);
            let eDiff = { path: path, reference: `${path}/fullpage_ref.png`, screenshot: `${path}/fullpage.png` };
            encodedDiffs.push(eDiff);
        }
        module.exports.generatePage(encodedDiffs);

    },
    generatePage: async (images) => {

        $html = module.exports.generateSwitcherHtml(images)
            .then(res => {
                process.chdir(config.app_dir);
                fs.writeFileSync(`${config.output_dir}output.html`, res, (err) => {
                    if (err) throw err;
                });

                console.log(`Output Generated. file://${config.app_dir}/output/output.html`.green);
            });
    },
    generateSwitcherHtml: async (diffs) => {
        let title = `Test Output: ${new Date().toDateString()}`;
        let template = fs.readFileSync(`${config.app_dir}/config/templates/output.html`, 'utf8');
        let activate = "active";
        template = template.replace('${title}', title);
        let html = '<div id="tabs">';
        for (let diff of diffs) {
            html += `<button class="${activate}" data-target-id='${diff.path}'>${diff.path}</button>`;
            activate = "";
        }
        html += '</div>';
        for (let diff of diffs) {
            let switcher = fs.readFileSync(`${config.app_dir}/config/templates/switcher.html`, 'utf8');
            switcher = switcher.replace(/\$\{reference\}/g, diff.reference);
            switcher = switcher.replace(/\$\{new\}/g, diff.screenshot);
            switcher = switcher.replace(/\$\{path\}/g, diff.path);
            html += switcher;
        }
        template = template.replace('${body}', html);
        return template;
    }
};