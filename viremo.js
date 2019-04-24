/* Package Dependencies */
const colors = require('colors');

// Local Dependencies
let browser = require('./app/browser');
let images = require('./app/images');
let filesystem = require('./app/filesystem');
let output = require('./app/output');

// runtime settings
let settings = require('./app/config/settings').default;
let websiteConfig = settings.default_config;
let website = null;

/** Process CLI Arguments */
process.argv.forEach(function(val,index,array) {
    if (val.match('-set-baseline')) {
        settings.baseline_mode = true;
    }
    if (val.match(/\-use\:.*/)) {
        websiteConfig = `./app/config/websites/${val.split(':')[1].trim()}`;
    }
});

/** Set the website configuration. */
try {
    website = require(websiteConfig);
} catch (e) {
    console.log(`Error: Cannot find module '${websiteConfig}' :: ${e}`.red);
    return;
}

/** Run main application */
(async () => {

    /** Validate the config. */
    let valid_config = browser.validate(website);
    if (!valid_config) {
        console.log("Invalid Website Configuration.".red);
        return;
    }

    /** Initialize the file system */
    let initialized = await filesystem.init(website, settings);
    if (!initialized) {
        console.log("Failed to initialize.".red);
        return;
    }

    /** Perform website crawl and capture */
    let process = await browser.process(website, settings);

    /** Handle errors and warnings */
    if (process.errors.length) {
        for (error of process.errors) {
            console.log(`${error}`.red);
        }
        return;
    }
    if (process.warnings.length) {
        process.warnings.forEach((warning) => {
            console.log(`WARNING:\t${warning.message} [${warning.path}]`.yellow);
        });
    }

    /** Optimize generated images. */
    if (settings.baseline_mode) {
        await images.optimizeReferences(website.label, settings);
        return;
    } else {
        await images.optimizeScreenshots(website.label, settings);
    }

    /** Compare screenshots to references */
    console.log('\nComparing to References...'.blue);
    images.analyze(process.analysis, settings)
        .then(async (diffs) => {
            if (diffs.length) {
                console.log("Differences found. Generating review output.".yellow);
                let preparedDiffs = await output.prepareOutput(diffs, website.label, settings);
                if (preparedDiffs) {
                    let html = await output.generateHtml(preparedDiffs);
                    if (html) {
                        filesystem.saveOutput(html, settings);
                        console.log('Output Generated ./screenshots/output/output.html.'.yellow);
                    }
                }
            } else {
                console.log("No differences found.".green);
            }
        }).catch((err) => {
            console.log(`err`.red);
        });

})();
