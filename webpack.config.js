const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './app/app.js',
  devtool: 'source-map',
  module: {
    rules: [{
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.styl(us)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader']
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html',
    }),
    new VueLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles/app.css'
    })
  ]
}