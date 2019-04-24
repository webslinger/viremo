const fs = require('fs-extra');
const assert = require('chai').assert;
const sharp = require('sharp');

let browser = require('../app/browser');
let filesystem = require('../app/filesystem');
let images = require('../app/images');
let config = require('../app/config/config');
let output = require('../app/output');

process.chdir('./');
let settings = require('../app/config/settings').getLocalizedSettings(`${process.cwd()}/tests/`);

if (!fs.existsSync(settings.shots_dir)) {
    fs.mkdirSync(settings.shots_dir);
}
if (!fs.existsSync(settings.screenshot_dir)) {
    fs.mkdirSync(settings.screenshot_dir);
}

if (!fs.existsSync(settings.reference_dir)) {
    fs.mkdirSync(settings.reference_dir);
}

if (!fs.existsSync(settings.output_dir)) {
    fs.mkdirSync(settings.output_dir);
}

let websiteFactory = (overrides = {}) => {
    let defaultConfig = config.default;
    return config.custom(
        overrides.label || defaultConfig.label,
        overrides.url || defaultConfig.url,
        overrides.viewports || defaultConfig.viewports,
        overrides.paths || defaultConfig.paths,
        overrides.shell || defaultConfig.shell
    );
};

describe('app/filesystem.js', () => {

    describe('init(website, settings) <Unhandled Exception>', function() {
        it('Should fail gracefully by returning false', function() {
            let result = filesystem.init(websiteFactory(), 'wrench');
            assert.strictEqual(result, false);
        });
    });

});

describe('app/browser.js', () => {

    describe('validate(website)', function() {
        it('Should fail to validate if no paths to test are specified',() => {
            let result = browser.validate(websiteFactory({paths: []}));
            assert.strictEqual(result, false);
        });
        it('Should fail to validate if paths are improperly defined.', () => {
            let result = browser.validate(websiteFactory({
                paths: [
                    {
                        label: "Test"
                    }
                ]
            }));
            assert.strictEqual(result, false);
        });
        it('Should fail to validate if no viewports are defined', () => {
            let result = browser.validate(websiteFactory({viewports: []}));
            assert.strictEqual(result, false);
        });
        it('Should fail to validate if viewports are improperly defined.', () => {
            let result = browser.validate(websiteFactory({
                viewports: [
                    {
                        label: "Test",
                        dims: ["a","b"]
                    }
                ]
            }));
            assert.strictEqual(result, false);
        });
        it('Should fail to validate if what is passed is not what is expected.', () => {
            let result = browser.validate("wrench");
            assert.strictEqual(result, false);
        });
        it('Should fail to validate if what is passed is missing required options.', () => {
            let result = browser.validate({ label: 'Website' });
            assert.strictEqual(result, false);
        });
        it('Should otherwise validate', () => {
            let result = browser.validate(websiteFactory());
            assert.isOk(result);
        })
    });

    describe('process(website, settings) <Empty Server Response>', function() {
        this.timeout(15000);
        it('Should return an error on empty response.', async () => {
            let result = await browser.process(websiteFactory({url: "https://www.google.hijklmnop/"}),settings, false);
            assert.isOk(result.errors);
        });
    });

    describe('process(website, settings) <Baseline Images Missing>', function() {
        it('Should return an error if baseline images are missing.', async () => {
            await filesystem.emptyDirectory(settings.reference_dir);
            settings.baseline_mode = false;
            filesystem.init(websiteFactory(), settings);
            let result = await browser.process(websiteFactory(), settings, false);
            assert.isOk(result.errors.length);
        });
    });

    describe('process(website, settings) <Null Selector>', function() {
       this.timeout(30000);
       it('Should return warnings if selectors are missing or invisible.', async () => {
           settings.baseline_mode = true;
           filesystem.init(websiteFactory(), settings);
           let result = await browser.process(websiteFactory({ shell: ['.google-moogly','textarea.csi'] }), settings, false);
           assert.isOk(result.warnings.length);
       })
    });

});

describe('app/images.js', function () {

    describe('optimizeReferences(website, custom_settings)', function() {
        it('Should fail silently when given bad arguments', async () => {
            let result = await images.optimizeReferences('sdfsa',{});
            assert.strictEqual(result, false);
        });
        it('Should fail silently when given no arguments', async () => {
            let result = await images.optimizeReferences();
            assert.strictEqual(result, false);
        });

    });

    describe('optimizeScreenshots(website, custom_settings)', function() {
        it('Should fail silently when given bad arguments', async () => {
            let result = await images.optimizeScreenshots('sdfsa',{});
            assert.strictEqual(result, false);
        });
        it('Should fail silently when given no arguments', async () => {
            let result = await images.optimizeScreenshots();
            assert.strictEqual(result, false);
        });
    });

});


describe('viremo.js -set-baseline', function() {

    describe('browser.validate(website)', function () {
        it('Should succeed by returning true', () => {
            let result = browser.validate(websiteFactory());
            assert.deepEqual(result, websiteFactory());
        })
    });

    describe('browser.init(website, settings)', function () {
        it('Should succeed by returning true.', () => {
            let result = filesystem.init(websiteFactory(), settings);
            assert.strictEqual(result, true);
        });
    });

    describe('browser.process(website, settings)', function () {
        this.timeout(60000);
        it('Should successfully process baseline images', async () => {
            settings.baseline_mode = true;
            let result = await browser.process(websiteFactory(), settings, false);

            assert.deepEqual(result.analysis[0], {
                image: 'desktop/header.png',
                path: 'homepage',
                viewport: 'desktop',
                website: 'google'
            });
        });
    });
});

describe('viremo.js', function() {

    describe('browser.validate(website)', function () {
        it('Should succeed by returning true', () => {
            let result = browser.validate(websiteFactory());
            assert.deepEqual(result, websiteFactory());
        })
    });

    describe('browser.init(website, settings)', function () {
        it('Should succeed by returning true.', () => {
            settings.baseline_mode = false;
            let result = filesystem.init(websiteFactory(), settings);
            assert.strictEqual(result, true);
        });
    });

    describe('browser.process(website, settings)', function() {
        this.timeout(60000);
        it('Should successfully process images and return results for analyzing', async () => {
            settings.baseline_mode = false;
            let result = await browser.process(websiteFactory(), settings, false);
            assert.deepEqual(result.analysis[0], {
                image: 'desktop/header.png',
                path: 'homepage',
                viewport: 'desktop',
                website: 'google'
            });
        });
    });

    describe('images.analyze(diffs)', function() {
        this.timeout(30000);
        it('Should return empty array of diffs since none will have changed', (done) => {
            images.analyze(
                [{
                    image: 'desktop/header.png',
                    path: 'homepage',
                    viewport: 'desktop',
                    website: 'google'
                }],
                settings
            ).then((diffs) => {
                assert.deepEqual(diffs,[]);
                done();
            });
        });
        this.timeout(30000);
        it('Should return array with diff, since one will have changed', (done) => {

            fs.removeSync(`${settings.screenshot_dir}google/homepage/desktop/header_new.png`);
            fs.removeSync(`${settings.reference_dir}google/homepage/desktop/header_new.png`);

            let image_count = 0;
            let compareImages = () => {
                images.analyze(
                    [{
                        image: 'desktop/header_new.png',
                        path: 'homepage',
                        viewport: 'desktop',
                        website: 'google'
                    }],
                    settings
                ).then((diffs) => {
                    assert.deepEqual(
                        diffs[0].case,
                        {
                            image: 'desktop/header_new.png',
                            path: 'homepage',
                            viewport: 'desktop',
                            website: 'google'
                        }
                    );
                    done();
                }).catch((err) => {
                    throw err;
                });
            };

            sharp(`${settings.screenshot_dir}google/homepage/desktop/header.png`)
                .negate()
                .toFile(`${settings.screenshot_dir}google/homepage/desktop/header_new.png`, (err, info) => {
                    if (err) throw err;
                    image_count++;
                    if (image_count == 2) {
                        compareImages();
                    }
                });

            sharp(`${settings.screenshot_dir}google/homepage/desktop/header.png`)
                .toFile(`${settings.reference_dir}google/homepage/desktop/header_new.png`, (err, info) => {
                    if (err) throw err;
                    image_count++;
                    if (image_count == 2) {
                        compareImages();
                    }
                });

        });
    });

    describe('extractDiffPaths(diffs)', function() {
        it('Should return diffs sorted by path', () => {
            let result = output.extractDiffPaths([
                {
                    case: {
                        image: 'desktop/header_new.png',
                        path: 'homepage',
                        viewport: 'desktop',
                        website: 'google'
                    }
                }
            ]);
            assert.deepEqual(
                result,
                ['homepage/desktop']
            )
        })
    });

    describe('prepareOutput(diffs)', function() {
        it('Should return a sorted array of diffs', async () => {
            let result = await output.prepareOutput(
                [{
                    case: {
                        image: 'desktop/header_new.png',
                        path: 'homepage',
                        viewport: 'desktop',
                        website: 'google'
                    }
                }],
                'google',
                settings
            );
            assert.deepEqual(
                result,
                [{
                    path: 'homepage/desktop',
                    reference: 'homepage/desktop/fullpage_ref.png',
                    screenshot: 'homepage/desktop/fullpage.png'
                }]

            )
        })
    });

    describe('generateHtml(diffs)', function() {
        it('Should return rendered html', async () => {
            let result = await output.generateHtml([{
                path: 'homepage/desktop',
                reference: 'homepage/desktop/fullpage_ref.png',
                screenshot: 'homepage/desktop/fullpage.png'
            }]);
            assert.strictEqual(typeof result, "string");
        })
    });

    describe('saveOutput(html, settings)', function() {
        it('Should save output to ./output/', async () => {
            let html = await output.generateHtml([{
                path: 'homepage/desktop',
                reference: 'homepage/desktop/fullpage_ref.png',
                screenshot: 'homepage/desktop/fullpage.png'
            }]);
            await filesystem.saveOutput(html, settings);
            return !!(fs.existsSync(`${settings.output_dir}output.html`));
        })
    });
});