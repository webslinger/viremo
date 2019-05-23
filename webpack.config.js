const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const fs = require('fs-extra');
const browser = require('./app/browser');

module.exports = {
  entry: './ui/main.js',
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.vue$/, use: 'vue-loader' },
      { test: /\.css$/, use: ['vue-style-loader', 'css-loader']},
    ]
  },
  devServer: {
      open: true,
      hot: true,
      port: 3000,
      before(app) {
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
      }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './ui/index.html',
    }),
    new VueLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
};