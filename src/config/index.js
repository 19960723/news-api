import path from 'path'
export const JWT_SECRET = 'shared-secret' // jwt 鉴权 key
export const mailKey = 'herhrjovjdwrebdf' // 邮箱服务授权码
// mongodb 鉴权链接
export const DB_URL = () => {
  const username = 'lxl'
  const password = '123456'
  const hostname = '123.56.45.69'
  const port = '27017'
  const db_name = 'imooc'
  return `mongodb://${username}:${password}@${hostname}:${port}/${db_name}`
}
export const baseUrl = process.env.NODE_ENV === 'production' ? 'http://lxlgw.top' : 'http://localhost:8080'

// redis
export const REDIS_CONFIG = {
  host: '123.56.45.69',
  port: 15003,
  password: '123456'
}
// 文件上传路径
export const fileUploadPath = process.env.NODE_ENV === 'production' ? '/app/public' : path.join(path.resolve(__dirname), '../public')
