import combineRouters from 'koa-combine-routers'
// 加载目录中的Router中间件
const modulesFiles = require.context('./modules', true, /\.js$/)

// reduce方法去拼接 koa-combine-router所需的数据结构 Object[]
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const value = modulesFiles(modulePath)
  modules.push(value.default)
  return modules
}, [])

export default combineRouters(modules)
