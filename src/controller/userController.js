import moment from 'dayjs'
import jwt from 'jsonwebtoken'
import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'
import SignRecord from '@/model/SignRecord'
import UserCollect from '@/model/UserCollect'
import User from '@/model/User'
import { getJWTPlayload } from '@/utils'
import { setValue, getValue } from '@/db/RedisDB'
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
        uid: obj._id,
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

/**
 * 更新用户基本信息接口
 * @param {*} ctx
 */

export const updateUserInfo = async(ctx) => {
  const { body } = ctx.request
  const obj = await getJWTPlayload(ctx.header.authorization)
  // 判断用户是否修改了邮箱
  const user = await User.findOne(({ _id: obj._id }))
  let msg = ''
  if (body.email && body.email !== user.email) {
    // 用户修改了邮箱
    // 发送reset邮箱

    // 判断用户的新邮箱是否已经有人注册
    const tmpUser = await User.findOne({ email: body.email })
    if (tmpUser && tmpUser.password) {
      ctx.body = {
        code: 501,
        msg: '邮箱已经注册'
      }
      return
    }
    const key = uuid()
    setValue(key, jwt.sign({ _id: obj._id }, JWT_SECRET, { expiresIn: '30m' }))
    await sendMail({
      type: 'email',
      data: {
        key: key,
        email: body.email
      },
      code: '',
      expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
      email: user.email,
      user: user.username
    })
    msg = '更新基本资料成功, 账号修改需要邮箱确认, 请查收邮箱!'
  }

  const arr = ['email', 'phone', 'password']
  arr.map(item => delete body[item])
  const result = await User.updateOne({ _id: obj._id }, body)
  if (result.n === 1 && result.ok === 1) {
    ctx.body = {
      code: 200,
      msg: msg === '' ? '更新成功' : msg
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '更新失败'
    }
  }
}
/**
 * 确认修改邮箱
 * @param {*} ctx
 */
export const resetEmail = async(ctx) => {
  const body = ctx.query
  if (body.key) {
    const token = await getValue(body.key)
    const obj = getJWTPlayload('Bearer ' + token)
    await User.updateOne({ _id: obj._id }, { email: body.email })
    ctx.body = {
      code: 200,
      msg: '更新邮箱成功'
    }
  }
}

/**
 * 修改密码接口
 * @param {*} ctx
 */
export const changePasswd = async(ctx) => {
  const { body } = ctx.request
  const obj = await getJWTPlayload(ctx.header.authorization)
  const user = await User.findOne({ _id: obj._id })
  if (await bcrypt.compare(body.oldpwd, user.password)) {
    const newpassword = await bcrypt.hash(body.newpwd, 5)
    await User.updateOne({ _id: obj._id }, { $set: { password: newpassword }})
    ctx.body = {
      code: 200,
      msg: '更新密码成功'
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '更新前后密码错误, 请检查!'
    }
  }
}
/**
 * 获取用户基本信息
 * @param {*} ctx
 */
export const getUserInfo = async(ctx) => {
  const params = ctx.query
  const uid = params.uid || ctx._id
  let user = await User.findById(uid)
  // 获得用户的签到记录 有没有 > tbody 0:00:00
  if (user) {
    user = user.toJSON()
    const date = moment().format('YYYY-MM-DD')
    const result = await SignRecord.findOne({
      uid: uid,
      created: {
        $gte: date + ' 00:00:00'
      }
    })
    if (result && result.uid) {
      user.isSign = true
    } else {
      user.isSign = false
    }
  }
  ctx.body = {
    code: 200,
    data: user,
    msg: '查询成功'
  }
}
/**
 * 设置收藏
 */
export const setCollect = async(ctx) => {
  const params = ctx.query
  const obj = await getJWTPlayload(ctx.header.authorization)
  if (parseInt(params.isFav)) {
    // 说明用户已经收藏帖子
    await UserCollect.deleteOne({ uid: obj._id, tid: params.tid })
    ctx.body = {
      code: 200,
      msg: '取消收藏成功'
    }
  } else {
    const newCollect = new UserCollect({
      uid: obj._id,
      tid: params.tid,
      title: params.title
    })
    console.log(params.title)
    const result = await newCollect.save()
    if (result.uid) {
      ctx.body = {
        code: 200,
        data: result,
        msg: '收藏成功'
      }
    }
  }
}
// 获取收藏列表
export const getCollectByUid = async(ctx) => {
  const params = ctx.query
  const obj = await getJWTPlayload(ctx.header.authorization)
  const result = await UserCollect.getListByUid(obj._id, params.page, params.limit ? parseInt(params.limit) : 10)
  const total = await UserCollect.countByUid(obj._id)
  if (result.length > 0) {
    ctx.body = {
      code: 200,
      data: result,
      total,
      msg: '查询列表成功'
    }
  } else {
    ctx.body = {
      code: 500,
      msg: '查询列表失败 '
    }
  }
}
