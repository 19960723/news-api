import mongoose from '../db/DBHelpler'
import moment from 'dayjs'

const Schema = mongoose.Schema

const PostSchema = new Schema({
  uid: { type: String, ref: 'users' }, // 用户ID
  title: { type: String }, // 文章标题
  content: { type: String }, // 文章内容
  created: { type: Date }, // 创建日期
  catalog: { type: String }, // 帖子分类
  fav: { type: String }, // 帖子积分
  isEnd: { type: String }, // 帖子状态(未结, 已结)
  redis: { type: Number }, // 阅读计数
  answer: { type: Number }, // 回答计数
  status: { type: String }, // (0-打开回复, 1-关闭回复)
  isTop: { type: String }, // 是否置顶
  sort: { type: String }, // 置顶排序
  tags: { // 文章的标签(精华、加精、etc)
    type: Array,
    default: [
      { name: '', class: '' }
    ]
  }
})

PostSchema.pre('save', function(next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

PostSchema.statics = {
  getList: function(options, sort, page, limit) {
    return this.find(options)
      .sort({ [sort]: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate({
        path: 'uid',
        select: 'name isVip pic'
      })
  },
  getTopWeek: function() {
    return this.find({
      created: {
        $gte: moment().subtract(7, 'days')
      }
    },
    {
      answer: 1,
      title: 1
    }).sort({ answer: -1 }).limit(15)
  }
}

const PostModel = mongoose.model('post', PostSchema)
export default PostModel