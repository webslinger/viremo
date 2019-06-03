const express = require('express')
const path = require('path');
const fs = require('fs');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const port = 3000
const viremo = require('viremo-cli').browser;
const images = require('viremo-cli').images;
let settings = require('./app/app.settings').NewSettings();

app.set('etag',false);
app.use(express.static(path.join(__dirname, 'dist/')))

/* API */
app.get('/v1/configs', async (request, response) => {
  let files = [];
  let count = 0;
  fs.readdirSync('./configurations').forEach(file => {
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
    for (let path in require.cache) {
      if (path.endsWith(request.params.config)) {
        delete require.cache[path];
      }
    }
    let requestConfig = require('./configurations/' + request.params.config);
    response.send(JSON.stringify(requestConfig));
  } catch (e) {
    console.log(e);
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
    "const config = require('viremo-cli').config;" +
    "module.exports = config.custom(" +
    `'${contents.label}',` +
    `'${contents.url}',` +
    `${JSON.stringify(contents.viewports)},` +
    `${JSON.stringify(contents.paths)},` +
    `${JSON.stringify(contents.actions)},` +
    `${JSON.stringify(contents.shell)}` +
    ");";
  try {
    await fs.writeFileSync(`./configurations/${filename}`, file_contents);
    response.send('success');
  } catch (e) {
    response.error(e);
  }
});

app.delete('/v1/configs/delete/:config', async (request, response) => {
  let config = request.params.config;
  try {
    await fs.unlinkSync(`./configurations/${config}`);
    response.send();
  } catch (e) {
    response.error(e)
  } 
});

server.listen(port, (err) => {
    if (err) {
        return console.log('error.', err);
    }
    console.log(`server is listening on port ${port}`)
}, "http://localhost");

io.on('connection', function (socket) {
  socket.on('start-test', async (data) => {
      let config = data.config;
      let baseline_mode = data.mode;
      let configObj = require(`./configurations/${config}`);
      settings.baseline_mode = baseline_mode;

      socket.emit('progress-update', 'Validating Configuration.');
      let progress = await viremo.validate(configObj);
      
      if (progress) {
        socket.emit('progress-update', 'Performing Captures. This may take a moment.');
        progress = await viremo.process(configObj, settings, false, function(message) {
          socket.emit('progress-update', message)
        });
      }

      if (progress) {
        if (progress.errors.length) {
          socket.emit('end-test', { errors: progress.errors });
          return;
        }
        if (progress.warnings.length) {
          socket.emit('progress-update', { warnings: progress.warnings });
        }
        if (baseline_mode) {
          socket.emit('end-test', { success: true });
          await images.optimizeReferences(config.label, settings);
        } else {
          await images.optimizeCaptures(config.label, settings);
          socket.emit('progress-update', 'Checking for Regressions.');
          images.analyze(progress.analysis, settings)
            .then(async (diffs) => {
              if (diffs.length) {
                socket.emit('end-test', { diffs: diffs });
              } else {
                socket.emit('end-test', { success: true, analysis: progress.analysis })
              }
            })
            .catch((err) => {
              socket.emit('end-test', { error: err });
              return;
            });
        }
      } else {
        socket.emit('end-test', { error: 'Something went wrong.'});
      }
  });
});
 