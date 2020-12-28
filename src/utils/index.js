import { getValue } from '../db/RedisDB'
import { JWT_SECRET } from '../config'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

/**
 * 验证 图形验证码
 * @param {*} key
 * @param {*} value
 */
export const checkCode = async(key, value) => {
  const redisData = await getValue(key)
  if (redisData === null) return false
  if (redisData.toLowerCase() === value.toLowerCase()) {
    return true
  } else {
    return false
  }
}

export const getJWTPlayload = token => {
  return jwt.verify(token.split(' ')[1], JWT_SECRET)
}
// 获取路径文件的状态
export const getStats = (path) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false)
      } else {
        resolve(stats)
      }
    })
  })
}
// 创建这个文件夹
export const mkdir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}
// 判断该路径是否存在 不存在: 创建
export const dirExists = async(dir) => {
  const isExists = await getStats(dir)
  // 如果该路径存在且不是文件, 返回true
  if (isExists && isExists.isDirectory()) {
    return true
  } else if (isExists) {
    // 路径存在，但是是文件，返回 false
    return false
  }
  // 如果该路径不存在
  const tempDir = path.parse(dir).dir
  // 循环遍历，递归判断如果上级目录不存在，则产生上级目录
  const status = await dirExists(tempDir)
  if (status) {
    const result = await mkdir(dir)
    return result
  } else {
    return false
  }
}
