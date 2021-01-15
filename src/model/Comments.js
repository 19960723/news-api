import mongoose from '../db/DBHelpler'

const Schema = mongoose.Schema

const CommentsSchema = new Schema({
  tid: { type: String, ref: 'post' }, // 文章ID
  uid: { type: String, ref: 'users' }, // 文章作者ID
  cuid: { type: String, ref: 'users' }, // 评论用户的ID
  content: { type: String }, // 回复内容
  hands: { type: Number, default: 0 }, // 点赞数量
  status: { type: String, default: '1' }, // 是否显示 0: 否,  1: 是
  isRead: { type: String, default: '0' }, // 是否已读 0: 否,  1: 是
  isBest: { type: String, default: '0' } // 是否采纳 0: 否,  1: 是
},
{
  toJSON: { virtuals: true }, timestamps: { createdAt: 'created', updatedAt: 'updated' }
})

CommentsSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Monngoose has a duplicate key.'))
  } else {
    next(error)
  }
})

CommentsSchema.statics = {
  getTotal: function() { },
  getCommentsList: function(id, page, limit) {
    return this.find({ tid: id })
      .skip(page * limit)
      .limit(limit)
      .populate({
        path: 'cuid',
        select: '_id username avatar isVip',
        match: { status: { $eq: '0' }}
      })
      .populate({
        path: 'tid',
        select: '_id title status'
      })
  },
  queryCount: function(id) {
    return this.find({ tid: id }).countDocuments()
  }
}

const CommentsModel = mongoose.model('comments', CommentsSchema)
export default CommentsModel
