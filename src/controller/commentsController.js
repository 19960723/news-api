import Comments from '@/model/Comments'
import CommentsHands from '@/model/CommentsHands'
import { checkCode, getJWTPlayload } from '@/utils'
// import User from '@/model/User'
import Post from '@/model/Post'

// 添加评论
export const addComment = async(ctx) => {
  const { body } = ctx.request
  const sid = body.sid
  const code = body.code
  // 验证图片验证码的时效性、正确性
  const result = await checkCode(sid, code)
  if (!result) {
    // 图片验证码验证失败
    ctx.body = {
      code: 500,
      msg: '图片验证码验证失败'
    }
    return
  }
  const newComment = new Comments(body)
  const obj = await getJWTPlayload(ctx.header.authorization)
  newComment.cuid = obj._id
  // 查询帖子的作者, 以便发生消息
  const post = await Post.findOne({ _id: body.tid })
  newComment.uid = post.uid
  const comment = await newComment.save()
  // 评论记数
  const updatePostresult = await Post.updateOne({ _id: body.tid }, { $inc: { answer: 1 }})
  if (comment._id && updatePostresult.ok === 1) {
    ctx.body = {
      code: 200,
      data: comment,
      msg: '评论成功'
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '评论失败'
    }
  }
}

// 获取评论列表
export const getComments = async(ctx) => {
  const params = ctx.query
  const tid = params.tid
  const page = params.page ? params.page : 0
  const limit = params.limit ? parseInt(params.limit) : 10
  let result = await Comments.getCommentsList(tid, page, limit)
  // 判断用户是否登录, 已经登录的用户才去判断点赞信息
  const auth = ctx.header.authorization
  const obj = auth ? await getJWTPlayload(auth) : {}
  if (obj._id) {
    result = result.map(item => item.toJSON())
    for (let i = 0; i < result.length; i++) {
      const item = result[i]
      item.handed = '0' // 默认为 0 点赞不高亮
      const commentHands = await CommentsHands.findOne({ cid: item._id, uid: obj._id })
      if (commentHands && commentHands.cid) {
        if (commentHands.uid === obj._id) {
          item.handed = '1'
        }
      }
    }
  }
  const total = await Comments.queryCount(tid)
  ctx.body = {
    code: 200,
    total,
    data: result,
    msg: '查询成功'
  }
}
// 更新评论
export const updateComment = async(ctx) => {

}
// 设置最佳答案
export const setBest = async(ctx) => {

}
// 评论点赞
export const setHands = async(ctx) => {
  const obj = await getJWTPlayload(ctx.header.authorization)
  const params = ctx.query
  // 判断用户是否已经点赞
  const tmp = await CommentsHands.find({ cid: params.cid, uid: obj._id })
  if (tmp.length > 0) {
    ctx.body = {
      code: 200,
      msg: '您已经点赞,请勿重复点赞'
    }
    return
  }
  // 新增一条点赞记录
  const comment = await Comments.findById(params.cid)
  const newHands = new CommentsHands({
    cid: params.cid,
    commentAuth: comment.cuid,
    uid: obj._id
  })
  const data = await newHands.save()

  // 更新comments中对应的记录 hands 信息 +1
  const result = await Comments.updateOne({ _id: params.cid }, { $inc: { hands: 1 }})
  if (result.ok === 1) {
    ctx.body = {
      code: 200,
      msg: '点赞成功',
      data: data
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '保存点赞记录失败!'
    }
  }
}
