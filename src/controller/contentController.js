import Post from '../model/Post'
import Links from '../model/Links'

/**
 * 获取文章列表
 * @param {*} ctx
 */
export const getPostList = async(ctx) => {
  const body = ctx.query
  // 测试数据

  // const post = new Post({
  //   title: 'test title1',
  //   content: 'test content 1',
  //   catalog: 'advise',
  //   fav: 20,
  //   isEnd: '0',
  //   reads: '0',
  //   answer: '0',
  //   status: '0',
  //   isTop: '0',
  //   sort: '0',
  //   tags: []
  // })
  // const tmp = await post.save()
  // console.log(tmp)

  const sort = body.sort ? body.sort : 'created'
  const page = body.page ? parseInt(body.page) : 0
  const limit = body.limit ? parseInt(body.limit) : 20
  const options = {}

  if (typeof body.catalog !== 'undefined' && body.catalog !== '') {
    options.catalog = body.catalog
  }
  if (typeof body.isTop !== 'undefined') {
    options.isTop = body.isTop
  }
  if (typeof body.status !== 'undefined') {
    options.status = body.status
  }
  if (typeof body.status !== 'undefined' && body.status !== '') {
    options.isEnd = body.status
  }
  if (typeof body.tag !== 'undefined' && body.tag !== '') {
    options.tags = { $elemMatch: { name: body.tag }}
  }
  const result = await Post.getList(options, sort, page, limit)
  ctx.body = {
    code: 200,
    data: result,
    msg: '获取文章列表成功'
  }
}

/**
 * 查询友链
 */
export const getLinks = async(ctx, next) => {
  const result = await Links.find({ type: 'links' })
  ctx.body = {
    code: 200,
    data: result
  }
}
/**
 * 查询温馨提醒
 */
export const getTips = async(ctx) => {
  const result = await Links.find({ type: 'tips' })
  ctx.body = {
    code: 200,
    data: result
  }
}

/**
 * 本周热议
 * @param {*} ctx
 */
export const getTopWeek = async(ctx) => {
  const result = await Post.getTopWeek()
  ctx.body = {
    code: 200,
    data: result
  }
}
