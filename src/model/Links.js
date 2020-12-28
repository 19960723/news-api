import mongoose from '../db/DBHelpler'
import moment from 'dayjs'

const Schema = mongoose.Schema

const LinksSchema = new Schema({
  title: { type: String, default: '' }, // 标题
  link: { type: String, default: '' }, // 链接
  type: { type: String, default: 'links' }, // 类型(links: 友链, tips: 温馨提醒)
  created: { type: Date }, // 创建时间
  isTop: { type: String, default: '' }, // 是否置顶
  sort: { type: String, default: '' } // 排序编号
})

LinksSchema.pre('save', function(next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

const LinksModel = mongoose.model('links', LinksSchema)
export default LinksModel
