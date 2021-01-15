import moment from 'dayjs'
import makeDir from 'make-dir'
import fs from 'fs'
import uuid from 'uuid/v4'
import User from '@/model/User'
import Post from '@/model/Post'
import { fileUploadPath } from '@/config'
import { checkCode, getJWTPlayload } from '@/utils'

/**
 * 上传图片
 * @param {*} ctx
 */
export const uploadImg2 = async(ctx) => {
  const file = ctx.request.files.file
  // 图片名称、图片格式、储存的位置 返回前台————可以读取的路径
  const ext = file.name.split('.').pop()
  const dir = `${fileUploadPath}/${moment().format('YYYYMMDD')}`
  // 判断路径是否存在, 不存在则创建
  await makeDir(dir)
  // 储存文件到指定的路径
  // 给文件一个唯一的名称
  const avatarName = uuid()
  const destPath = `${dir}/${avatarName}.${ext}`
  const reader = fs.createReadStream(file.path)
  const upStream = fs.createWriteStream(destPath)
  const filePath = `/${moment().format('YYYYMMDD')}/${avatarName}.${ext}`
  reader.pipe(upStream)
  ctx.body = {
    code: 200,
    msg: '图片上传成功',
    data: filePath
  }
}

export const uploadImg = async(ctx) => {
  const file = ctx.request.files.file
  // 图片名称、图片格式、储存的位置 返回前台————可以读取的路径
  /**
   * ext: 返回文件后缀
   */
  const ext = file.name.split('.').pop()
  const dir = `${fileUploadPath}/${moment().format('YYYYMMDD')}`
  // 判断路径是否存在, 不存在则创建
  await makeDir(dir)
  // 储存文件到指定的路径
  // 给文件一个唯一的名称
  const avatarName = uuid()
  const destPath = `${dir}/${avatarName}.${ext}`
  const reader = fs.createReadStream(file.path)
  const upStream = fs.createWriteStream(destPath)
  const filePath = `/${moment().format('YYYYMMDD')}/${avatarName}.${ext}`
  reader.pipe(upStream)
  ctx.body = {
    code: 200,
    msg: '图片上传成功',
    data: filePath
  }
}

/**
 * 添加新帖子
 * @param {*} ctx
 */
export const addPost = async(ctx) => {
  const { body } = ctx.request
  const sid = body.sid
  const code = body.code
  // 验证图片验证码的时效性、正确性
  const result = await checkCode(sid, code)
  if (result) {
    const obj = await getJWTPlayload(ctx.header.authorization)
    // 判断用户的积分数是否 > fav，否则，提示用户积分不足发贴
    // 用户积分足够的时候，新建Post，减除用户对应的积分
    const user = await User.findByID({ _id: obj._id })
    if (user.favs < body.favs) {
      ctx.body = {
        code: 501,
        msg: '积分不足'
      }
      return
    } else {
      await User.updateOne({ _id: obj._id }, { $inc: { favs: -body.fav }})
    }
    const newPost = new Post(body)
    newPost.uid = obj._id
    const result = await newPost.save()
    ctx.body = {
      code: 200,
      msg: '成功的保存的文章',
      data: result
    }
  } else {
    // 图片验证码验证失败
    ctx.body = {
      code: 500,
      msg: '图片验证码验证失败'
    }
  }
}

/**
 * 更新帖子
 * @param {*} ctx
 */
export const updatePost = async(ctx) => {
  const { body } = ctx.request
  const sid = body.sid
  const code = body.code
  // 验证图片验证码的时效性、正确性
  const result = await checkCode(sid, code)
  if (result) {
    const obj = await getJWTPlayload(ctx.header.authorization)
    // 判断帖子作者是否为本人
    const post = await Post.findOne({ _id: body.tid })
    // 判断帖子是否结帖
    if (post.uid === obj._id && post.isEnd === '0') {
      const result = await Post.updateOne({ _id: body.tid }, body)
      if (result.ok === 1) {
        ctx.body = {
          code: 200,
          data: result,
          msg: '更新帖子成功'
        }
      } else {
        ctx.body = {
          code: 500,
          data: result,
          msg: '编辑帖子, 更新失败'
        }
      }
    } else {
      ctx.body = {
        code: 401,
        msg: '没有操作的权限'
      }
    }
  } else {
    // 图片验证码验证失败
    ctx.body = {
      code: 500,
      msg: '图片验证码验证失败'
    }
  }
}

/**
 * 获取用户发帖记录
 * @param {*} ctx
 */
export const getPostByUid = async(ctx) => {
  const params = ctx.query
  const obj = await getJWTPlayload(ctx.header.authorization)
  const result = await Post.getListByUid(
    obj._id,
    params.page,
    params.limit ? parseInt(params.limit) : 10
  )
  // const total = await Post.countByUid(obj._id)
  if (result.length > 0) {
    ctx.body = {
      code: 200,
      data: result,
      // total,
      msg: '查询列表成功'
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '查询列表失败'
    }
  }
}

/**
 * 删除发帖记录
 */
export const deletePostByUid = async(ctx) => {
  const params = ctx.query
  const obj = await getJWTPlayload(ctx.header.authorization)
  const post = await Post.findOne({ uid: obj._id, _id: params.tid })
  if (post.id === params.tid && post.isEnd === '0') {
    const result = await Post.deleteOne({ _id: params.tid })
    if (result.ok === 1) {
      ctx.body = {
        code: 200,
        msg: '删除成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '删除失败'
      }
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '删除失败, 无权限'
    }
  }
}
/**
 * 删除帖子 和相关依据
 * @param {*} ctx
 */
export const deletePost = async(ctx) => {
  const { body } = ctx.request
  // 删除帖子的同时要删除关联表中依据 (评论、收藏、浏览历史)
  const result = await Post.deleteManyAndRef({ _id: { $in: body.ids }})
  if (result.ok === 1) {
    ctx.body = {
      code: 200,
      msg: '删除成功'
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '删除失败'
    }
  }
}
