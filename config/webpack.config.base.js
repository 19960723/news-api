const path = require('path')
const config = require('./config')
const webpack = require('webpack')
const nodeExcternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const webpackconfig = {
  target: 'node',
  entry: {
    server: path.join(config.APP_PATH, 'main.js')
  },
  resolve: {
    ...config.getWebpackResolveConfig()
  },
  output: {
    path: config.DIST_PATH,
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: [path.join(__dirname, '/node_modules')]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV:
          process.env.NODE_ENV === 'production' ||
            process.env.NODE_ENV === 'prod'
            ? "'production'"
            : "'development'"
      }
    })
  ],
  externals: [nodeExcternals()],
  node: {
    global: false,
    __filename: false,
    __dirname: false
  }
  // node: {
  //   console: true,
  //   global: true,
  //   process: true,
  //   Buffer: true,
  //   __filename: true,
  //   __dirname: true,
  //   setImmediate: true,
  //   path: true
  // },
}

module.exports = webpackconfig
