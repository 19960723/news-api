import { getValue } from '../db/RedisDB'

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

