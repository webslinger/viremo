const express = require('express')
const path = require('path');
const fs = require('fs');
const app = express()
const port = 3000
const viremo = require('./app/browser');

app.use(express.static(path.join(__dirname, 'dist/')))

/* API */
app.get('/v1/configs', async (request, response) => {
    let files = [];
    let count = 0;
    fs.readdirSync('./app/configs').forEach(file => {
        files.push({
            id: count,
            name: file
        });
        count++;
    })
    response.send(JSON.stringify(files));
});

app.get('/v1/configs/:config', async (request, response) => {
    try {
        let requestConfig = require('./app/configs/' + request.params.config);
        response.send(JSON.stringify(requestConfig));
    } catch (e) {
        response.send(JSON.stringify({
            error: 'Config not found.'
        }));
    }
});

app.get('/v1/configs/validate/:config', async (request, response) => {
    let config = request.params.config;
    var valid = await browser.validate(config);
    response.send(valid);
});

app.put('/v1/configs/save', async (request, response) => {
    let filename = request.query.file;
    let contents = JSON.parse(request.query.contents);
    let file_contents = "" +
        "const config = require('../config');" +
        "module.exports = config.custom(" +
        `'${contents.label}',` +
        `'${contents.url}',` +
        `${JSON.stringify(contents.viewports)},` +
        `${JSON.stringify(contents.paths)},` +
        `${JSON.stringify(contents.actions)},` +
        `${JSON.stringify(contents.shell)}` +
    ");";
    await fs.writeFileSync(`./app/configs/${filename}`, file_contents);
    response.send('success');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('error.', err);
    }
    console.log(`server is listening on port ${port}`)
})
