const fs = require('fs-extra');

// local modules
let browser = require('./app/browser');
let differ = require('./app/differ');

// config
let config = require('./config/settings');
let websiteConfig = './config/websites/default';

let args = [];

process.argv.forEach(function(val,index,array) {
    args.push(val);
    if (val.match('-set-baseline')) {
        config.baseline_mode = true;
    }
    if (val.match(/\-use\:.*/)) {
        websiteConfig = `./config/websites/${val.split(':')[1].trim()}`;
    }
});

try {
    website = require(websiteConfig);
    config.target_website = website.label;
} catch (e) {
    throw `Error: Cannot find module '${websiteConfig}'`.red;
}

if (!fs.existsSync(config.shots_dir)) {
    fs.mkdirSync(config.shots_dir);
}
if (!fs.existsSync(config.screenshot_dir)) {
    fs.mkdirSync(config.screenshot_dir);
}

if (!fs.existsSync(config.reference_dir)) {
    fs.mkdirSync(config.reference_dir);
}

if (!fs.existsSync(config.output_dir)) {
    fs.mkdirSync(config.output_dir);
}

(async () => {
    let process = await browser.process(website, config);

    if (process) {
        console.log('Analyzing Screenshots for Regressions...'.blue);
        await differ.analyzeImages(process);
    }
})();
