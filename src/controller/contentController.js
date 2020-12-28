import moment from 'dayjs'
import makeDir from 'make-dir'
import fs from 'fs'
import uuid from 'uuid/v4'

import { fileUploadPath } from '@/config'

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
