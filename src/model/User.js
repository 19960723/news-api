import mongoose from '../db/DBHelpler'
import moment from 'dayjs'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: { type: String }, // 邮箱
  username: { type: String }, // 昵称
  password: { type: String }, // 密码
  created: { type: Date }, // 注册时间
  updated: { type: Date }, // 更新时间
  favs: { type: Number, default: 100 }, // 积分
  gender: { type: String, default: '' }, // 性别
  roles: { type: Array, default: ['user'] }, // 角色 (普通用户、管理员)
  avatar: { type: String, default: '' }, // 头像
  phone: { type: String, match: /^1[3-9](\d{9})$/, default: '' }, // 手机号码
  status: { type: String, default: '0' }, // 状态 是否被禁用
  regmark: { type: String, default: '' }, // 个性签名
  location: { type: String, default: '' }, // 城市 地址
  isVip: { type: String, default: '0' }, // 是否Vip
  count: { type: Number, default: 0 } // 签到次数
})

UserSchema.pre('save', function(next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

UserSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Monngoose has a duplicate key.'))
  } else {
    next(error)
  }
})

UserSchema.statics = {
  findByID: function(id) {
    return this.findOne({ _id: id }, {
      password: 0,
      email: 0,
      phone: 0
    })
  }
}

const UserModel = mongoose.model('users', UserSchema)

export default UserModel
