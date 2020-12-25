import redis from 'redis'
import { promisifyAll } from 'bluebird' // node Redis 当前不支持promise, 可以使用nodejs 内置的 util.promisefy
import { REDIS_CONFIG } from '../config'

const options = {
  host: REDIS_CONFIG.host,
  port: REDIS_CONFIG.port,
  password: REDIS_CONFIG.password,
  detect_buffers: true,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // 结束对特定错误的重新连接，并使用刷新所有命令
      return new Error('服务器拒绝连接')
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // 在特定的超时后结束重新连接并刷新所有命令
      return new Error('重试时间已用尽')
    }
    if (options.attempt > 10) {
      // 结束重新连接并出现内置错误
      return undefined
    }
    // 重新连接
    return Math.min(options.attempt * 100, 3000)
  }
}

export const client = promisifyAll(redis.createClient(options))
client.on('error', (error) => {
  console.error('Redis Client Error: ' + error)
})
client.on('connect', function() {
  console.log('Redis连接成功.')
})

export const getValue = (key) => {
  return client.getAsync(key)
}

export const setValue = (key, value, expire) => {
  if (typeof value === 'undefined' || value === null || value === '') return
  if (typeof value === 'string') {
    if (typeof time !== 'undefined') {
      client.set(key, value, 'EX', expire)
    } else {
      client.set(key, value)
    }
  } else if (typeof value === 'object') {
    Object.keys(value).forEach(item => {
      client.hset(key, item, value[item], redis.print)
    })
  }
}

