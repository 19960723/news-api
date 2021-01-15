import mongoose from '../db/DBHelpler'

const Schema = mongoose.Schema

const UserCollectSchema = new Schema({
  uid: { type: String },
  tid: { type: String, ref: 'post' },
  title: { type: String }
},
{ timestamps: { createdAt: 'created', updatedAt: 'updated' }}
)

UserCollectSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Monngoose has a duplicate key.'))
  } else {
    next(error)
  }
})

UserCollectSchema.statics = {
  // 查询特定用户的收藏数据
  getListByUid: function(id, page, limit) {
    return this.find({ uid: id })
      .skip(limit * page)
      .limit(limit)
      .sort({ created: -1 })
  },
  // 查询总数
  countByUid: function(id) {
    return this.find({ uid: id }).countDocuments()
  }
}

const UserCollectModel = mongoose.model('user_collect', UserCollectSchema)

export default UserCollectModel
