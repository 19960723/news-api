import mongoose from 'mongoose'
import { DB_URL } from '../config'

mongoose.set('useCreateIndex', true)
// 创建连接
mongoose.connect(DB_URL(), {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
mongoose.set('useFindAndModify', false)

// 连接成功
mongoose.connection.on('open', () => {
  console.log('Mongoose connection open to ' + DB_URL())
})

// 连接失败
mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error' + err)
})

// 断开连接
mongoose.connection.on('close', () => {
  console.log('Mongoose connection disconnected')
})

export default mongoose

