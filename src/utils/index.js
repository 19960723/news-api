import { getValue } from '../db/RedisDB'
import { JWT_SECRET } from '../config'
import jwt from 'jsonwebtoken'

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

