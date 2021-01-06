import svgCaptcha from 'svg-captcha'
import Post from '@/model/Post'
import Links from '@/model/Links'
import { setValue } from '@/db/RedisDB'

// 获取图片验证码
export const getCaptcha = (ctx) => {
  const body = ctx.request.query
  const newCaptca = svgCaptcha.create({
    size: 4,
    ignoreChars: '0o1il',
    color: true,
    noise: Math.floor(Math.random() * 5),
    width: 150,
    height: 38
  })
  // 保存图片验证码数据, 设置超时时间, 单位 s
  // 设置图片验证码超时10分钟
  setValue(body.sid, newCaptca.text, 10 * 60)
  ctx.body = {
    code: 200,
    data: newCaptca.data
  }
}
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

  if (body.catalog && body.catalog > 0) {
    options.catalog = body.catalog
  }
  if (body.title) {
    options.title = { $regex: body.title }
  }
  if (body.isTop) {
    options.isTop = body.isTop
  }
  if (body.isEnd) {
    options.isEnd = body.isEnd
  }
  if (body.status) {
    options.isEnd = body.status
  }
  if (typeof body.tags !== 'undefined' && body.tags !== '') {
    options.tags = { $elemMatch: { name: body.tags }}
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

// 测试
export const test = async(ctx) => {
  const keys = { title: '不可一世', name: 'lxl', age: '23', link: 'http://www.baidu.com', src: 'https://i.pinimg.com/236x/54/87/a6/5487a6ceb6ac2c092fbf82ab435ee90c.jpg' }
  setValue('key2', keys)
  ctx.body = {
    code: 200,
    msg: 'hello'
  }
}
/**
 * 获取文章详情
 * @param {*} ctx
 */
export const getPostDetail = async(ctx) => {
  const params = ctx.query
  if (!params.tid) {
    ctx.body = {
      code: 500,
      msg: '文章标题为空'
    }
  }
  const post = await Post.findByTid(params.tid)
  ctx.body = {
    code: 200,
    data: post,
    msg: '查询文章详情成功'
  }
}
