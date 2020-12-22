const path = require('path')
import config from './config'
console.log(config)
module.exports = {
  entry: path.join(__dirname, '../src/main.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'my-first-webpack.bundle.js'
  }
}
