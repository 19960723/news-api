import Koa from 'koa'
import path from 'path'
import statics from 'koa-static'
import cors from '@koa/cors'
import helmet from 'koa-helmet'
import koaBody from 'koa-body'
import jsonUtil from 'koa-json'
import JWT from 'koa-jwt'
import routes from './routes'

import compose from 'koa-compose'
import compress from 'koa-compress'
import { JWT_SECRET } from './config'
import errorHandle from './common/ErrorHandle'
const app = new Koa()
const isDevMode = !(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod')
// 定义公共路径，不需要jwt鉴权
const jwt = JWT({ secret: JWT_SECRET }).unless({ path: [/^\/public/, /^\/user/] }) // 正则排除 /public /login  接口拦截

const middlewar = compose([
  statics(path.resolve(__dirname, '../public')), // 静态资源指向  public
  cors(),
  helmet(),
  koaBody(),
  jsonUtil({ pretty: false, param: 'pretty' }),
  jwt,
  errorHandle
])

if (!isDevMode) {
  // 运行环境为 生产模式 production
  app.use(compress(middlewar))
} else {
  app.use(middlewar)
}

const port = !isDevMode ? 12005 : 3800
app.use(routes())

app.listen(port, () => {
  console.log(`http://localhost:${port} 服务已开启`)
})
