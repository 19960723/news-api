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
export const uploadImg = async(ctx) => {
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
