const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

// statistics
let warnings = [];
let errors = [];
let analysis = [];


module.exports = {
    process: async (website, config) => {

        let validatePath = async (domain, label) => {
            if (!fs.existsSync(domain)) {
                fs.mkdirSync(domain);
            }
            process.chdir(domain);
            if (!fs.existsSync(label)) {
                fs.mkdirSync(label);
                process.chdir(label);
            }
            process.chdir(config.app_dir);
            process.chdir(config.screenshot_dir);
            return domain + '/' + label + '/';
        };

        fs.emptyDir(`${config.screenshot_dir}${config.target_website}`);
        if (config.baseline_mode) {
            fs.emptyDir(`${config.reference_dir}${config.target_website}`)
        }

        const browser = await puppeteer.launch({ignoreHTTPSErrors: true});
        let page = await browser.newPage();
        let selector = null;
        let save_path = null;

        await page.setViewport({
            width: 1200,
            height: 1768
        });

        process.chdir(config.app_dir);
        process.chdir(config.screenshot_dir);

        console.log(`Analyzing ${website.label}`.blue);

        if (website.paths.length) {
            for (let p = 0; p < website.paths.length; p++) {
                console.log(`Opening ${website.url}${website.paths[p].path}`);
                try {
                    await page.goto(website.url + website.paths[p].path);
                } catch (e) {
                    errors.push(`Page Note Found: ${website.url}${website.paths[p].path}`);
                    continue;
                }
                selector = await page.$('body');
                if (selector) {
                    save_path = await validatePath(website.label, website.paths[p].label);
                    selector.screenshot({path: `${save_path}fullpage.png`});
                    if (!config.baseline_mode) {
                        if (!fs.existsSync(`${config.app_dir}/${config.reference_dir}${save_path}fullpage.png`)) {
                            errors.push(`Path ${website.paths[p].path} has no reference images. Please re-establish baseline images.`);
                        }
                    }
                }
                if (website.paths[p].shell) {
                    console.log("\tCapturing Shell Elements...".blue);
                    for (let i = 0; i < website.shell.length; i++) {
                        try {
                            await page.waitForSelector(website.shell[i], { timeout: 1000 });
                        } catch (e) {}
                        selector = await page.$(website.shell[i]);
                        if (selector) {
                            save_path = await validatePath(website.label, website.paths[p].label);
                            await selector.screenshot({path: `${save_path}${website.shell[i]}`.replace(/\s\./g, '_') + ".png"});
                            analysis.push({
                                website: website.label,
                                path: website.paths[p].label,
                                image: `${website.shell[i]}`.replace(/\s\./g, '_') + '.png'
                            });
                        } else {
                            warnings.push({
                                message: `Selector "${website.shell[i]}" is null.`,
                                path: website.paths[p].path
                            });
                        }
                    }
                }
                if (website.paths[p].elements.length) {
                    console.log("\tCapturing Page Elements...".blue);
                    for (let e = 0; e < website.paths[p].elements.length; e++) {
                        try {
                            await page.waitForSelector(website.paths[p].elements[e], { timeout: 1000 });
                        } catch (e) {}
                        selector = await page.$(website.paths[p].elements[e]);
                        if (selector) {
                            save_path = await validatePath(website.label, website.paths[p].label);
                            await selector.screenshot({path: `${save_path}${website.paths[p].elements[e]}`.replace(/\s\./g, '_') + '.png'});
                            analysis.push({
                                website: website.label,
                                path: website.paths[p].label,
                                image: `${website.paths[p].elements[e]}`.replace(/\s\./g, '_') + '.png'
                            });
                        } else {
                            warnings.push({
                                message: `Selector "${website.paths[p].elements[e]}" is null.`,
                                path: website.paths[p].path
                            });
                        }
                    }
                }
            }
        } else {
            errors.push("No Paths Specified.");
        }

        await browser.close();

        if (config.baseline_mode) {
            process.chdir(config.app_dir);
            await fs.copy(`${config.screenshot_dir}${config.target_website}`, `${config.reference_dir}${config.target_website}`);
            (async () => {
                const screenshots = await imagemin([`screenshots_reference/${config.target_website}/*.png`], {
                    plugins: [
                        imageminPngquant({
                            strip: true,
                            quality: [0.6,0.8]
                        })
                    ]
                });
            })();
            console.log("Baseline images created!".green);
            return false;
        } else {
            if (!errors.length) {
                console.log("Capturing complete.".green);
                if (warnings.length) {
                    warnings.forEach((warning) => {
                        console.log(`WARNING:\t${warning.message}`.yellow);
                        console.log(`\t\t${warning.path}`.yellow)
                    });
                }
                (async () => {
                    const screenshots = await imagemin([`screenshots_reference/${config.target_website}/*.png`], {
                        plugins: [
                            imageminPngquant({
                                strip: true,
                                quality: [0.6,0.8]
                            })
                        ]
                    });
                })();
                return analysis;
            } else {
                for (error of errors) {
                    console.log(`${error}`.red);
                }
                console.log('Terminating.'.red);
            }
            return false;
        }
    }
};
