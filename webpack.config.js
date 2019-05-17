require('babel-polyfill');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');
const fs = require('fs-extra');

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