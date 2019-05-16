const express = require('express')
const path = require('path');
const fs = require('fs');
const app = express()
const port = 3000
const viremo = require('./app/browser');

app.use(express.static(path.join(__dirname, 'app/ui')))
app.use(express.static(path.join(__dirname, 'app/ui/js')))

/* API */
app.get('/v1/get/configs', async (request, response) => {
    let files = [];
    fs.readdirSync('./app/configs').forEach(file => {
        files.push(file);
    })
    response.send(JSON.stringify(files));
});

app.get('/v1/get/config/:config', async (request, response) => {
    try{
        let requestConfig = require('./app/configs/'+request.params.config);
        response.send(JSON.stringify(requestConfig));
    } catch (e) {
        response.send(JSON.stringify({error: 'Config not found.'}));
    }
});

app.listen(port, (err) => {
    if (err) {
        return console.log('error.', err);
    }
    console.log(`server is listening on port ${port}`)
})
