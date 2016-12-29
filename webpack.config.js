'use strict'
var path = require('path')
var webpack = require('webpack')

var PRODUCTION = (process.env.NODE_ENV === 'production')

var config = {
  entry: path.resolve(__dirname, 'src/app.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'src/app')
      ],
      loader: 'babel-loader'
    }]
  },
}

if (PRODUCTION) {
  config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ]
}

module.exports = config
