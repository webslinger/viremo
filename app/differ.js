const fs = require('fs-extra');
const looksSame = require('looks-same');
const colors = require('colors');

let config = require('../config/settings.js');
let output = require('./output.js');

module.exports = {
    analyzeImages: (analysis) => {
        let diff_log = [];
        let diffs = [];
        let count = 0;
        process.chdir(config.app_dir);
        for (let test_case of analysis) {
            let full_path = `${test_case.website}/${test_case.path}/${test_case.image}`;
            looksSame(`${config.reference_dir}${full_path}`, `${config.screenshot_dir}${full_path}`, function(error, {equal}) {
                if (error) throw error;
                let result = {equal};
                if (!result.equal) {
                    diff_log.push({
                        case: test_case,
                        path: full_path
                    });
                }
                count++;
                if (count == analysis.length) {
                    if (diff_log.length) {
                        console.log("Differences found. Generating review output.".yellow);
                        output.generateOutput(module.exports.sortDiffsByPath(diff_log));
                    } else {
                        console.log("No differences found.".green)
                    }
                }
            });
        }
    },
    sortDiffsByPath: (diffs) => {
        let sorted_diffs = {
            website: null,
            paths: [],
        };
        for (diff of diffs) {
            if (!sorted_diffs.website) {
                sorted_diffs.website = diff.case.website;
            }
            if (!sorted_diffs.paths.includes(diff.case.path)) {
                sorted_diffs.paths.push(diff.case.path);
            }
        }
        return sorted_diffs;
    }
};