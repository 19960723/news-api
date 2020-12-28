import moment from 'dayjs'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'
import SignRecord from '@/model/SignRecord'
import User from '@/model/User'
import { getJWTPlayload } from '@/utils'
import { setValue } from '@/db/RedisDB'
import { JWT_SECRET } from '@/config'
import sendMail from '@/db/MailConfig'

/**
 * 用户签到接口
 * @param {} ctx
 */
export const userSign = async(ctx) => {
  // 取用户的ID
  const obj = await getJWTPlayload(ctx.header.authorization)
  // 查询用户上一次签到记录
  const record = await SignRecord.findByUid(obj._id)
  const user = await User.findById(obj._id)

  let newRecord = {} // SignRecord 对象
  let result = ''
  // 判断签到逻辑
  if (record !== null) {
    // 有历史的签到数据
    // 判断用户上一次签到记录的created时间是否与今天相同
    // 如果当前时间的日期与用户上一次的签到日期相同, 说明已经签到
    if (moment(record.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      ctx.body = {
        code: 500,
        favs: user.favs,
        count: user.count,
        lastSign: record.created,
        msg: '用户今天已经签到'
      }
      return
    } else {
      // 有上一次的签到记录 并且不与今天相同, 进行连续签到的判断
      // 如果相同, 代表用户是在连续签到
      let count = user.count
      let fav = 0
      // 判断签到时间: 用户上一次的签到时间等于 当前时间的前一天, 说明: 用户在连续签到
      // 第 n+1 天签到的时候, 需要与第n天created比较
      if (moment(record.created).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD')) {
        // 连续签到的积分获取逻辑
        count += 1
        if (count < 5) {
          fav = 5
        } else if (count >= 5 && count < 15) {
          fav = 10
        } else if (count >= 15 && count < 30) {
          fav = 15
        } else if (count >= 30 && count < 100) {
          fav = 20
        } else if (count >= 100 && count < 365) {
          fav = 30
        } else if (count > 365) {
          fav = 50
        }
        await User.updateOne({ _id: obj._id }, { $inc: { favs: fav, count: 1 }})
        result = { favs: user.favs + fav, count: user.count + 1 }
      } else {
        // 用户中断了一次签到 重置
        // 第 n+1 天签到的时候, 需要与第n天的created比较 如果不相等 说明中断了签到
        fav = 5
        await User.updateOne({ _id: obj._id }, { $set: { count: 1 }, $inc: { favs: fav }})
        result = {
          favs: user.favs + fav,
          count: 1
        }
      }
      // 更新签到数据
      newRecord = new SignRecord({
        uid: obj._uid,
        favs: fav
      })
      await newRecord.save()
    }
  } else {
    // 无签到数据 => 第一次签到
    // 保存用户的签到数据, 签到计数 + 积分数据
    await User.updateOne({
      _id: obj._id
    },
    {
      $set: { count: 1 },
      $inc: { favs: 5 }
    })
    // 保存用户的签到记录
    newRecord = new SignRecord({ uid: obj._id, favs: 5 })
    await newRecord.save()
    result = {
      favs: user.favs + 5,
      count: 1
    }
  }
  ctx.body = {
    code: 200,
    msg: '请求成功',
    ...result,
    lastSign: newRecord.created
  }
}

// 更新用户基本信息接口

export const updateUserInfo = async(ctx) => {
  const { body } = ctx.request
  const obj = await getJWTPlayload(ctx.header.authorization)
  // 判断用户是否修改了邮箱
  const user = await User.findOne(({ _id: obj._id }))
  if (body.email && body.email !== user.email) {
    // 用户修改了邮箱
    // 发送reset邮箱
    const key = uuid()
    setValue(key, jwt.sign({ _id: obj._id }, JWT_SECRET, { expiresIn: '30m' }))
    const result = await sendMail({
      type: 'email',
      key: key,
      code: '',
      expire: moment.add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
      email: user.email,
      user: user.username
    })
    ctx.body = {
      code: 500,
      data: result,
      msg: '发送验证码邮箱成功, 请点击链接确认修改邮件账号!'
    }
  } else {
    const arr = ['email', 'phone', 'password']
    arr.map(item => delete body[item])
    const result = await User.update({ _id: obj._id }, body)
    if (result.n === 1 && result.ok === 1) {
      ctx.body = {
        code: 200,
        'msg': '更新成功'
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '更新失败'
      }
    }
  }
}
