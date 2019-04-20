const path = require('path');

module.exports = {
    shots_dir: "screenshots",
    screenshot_dir: "screenshots/new/",
    reference_dir: "screenshots/reference/",
    output_dir: "screenshots/output/",
    app_dir: path.dirname(require.main.filename),
    baseline_mode: false,
    target_website: null
};