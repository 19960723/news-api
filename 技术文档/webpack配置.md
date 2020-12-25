## webpack
```js
{
  target: 'node', // 因为服务器和浏览器代码都可以用 JavaScript 编写，所以 webpack 提供了多种构建目标(target)
  externals: [nodeExcternals()], // 用于排除node_modules目录下的代码被打包进去
  node: {
  },
  mode: '',// 运行模式
  devtool: '', // 
}
```

## webpack 中间件
$ clean-webpack-plugin  清除dist插件

$ webpack-node-externals  排除node_modules 模块

$ webpack-merge  合并 webpack

$ terser-webpack-plugin  生产模式下 压缩js