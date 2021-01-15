import mongoose from '../db/DBHelpler'

const Schema = mongoose.Schema

const HandsSchema = new Schema({
  cid: { type: String, ref: 'comments' }, // 评论ID
  uid: { type: String, ref: 'users' }, // 点赞用户的ID
  commentAuth: { type: String, ref: 'users' }
},
{ timestamps: { createdAt: 'created', updatedAt: 'updated' }}
)

HandsSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Monngoose has a duplicate key.'))
  } else {
    next(error)
  }
})

HandsSchema.statics = {
}

const HandsModel = mongoose.model('comments_hands', HandsSchema)
export default HandsModel
