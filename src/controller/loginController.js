// import gravatar from 'gravatar'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'dayjs'
import User from '../model/User'
import { JWT_SECRET } from '../config/index'
import sendMail from '../db/MailConfig'
import { checkCode } from '../utils'

/**
 *
 * @param {*} email 邮箱
 * @param {*} password 密码
 * @param {*} code 图形验证码
 * @param {*} sid 随机串 与图形验证码 关联
 */
export const Login = async(ctx, next) => {
  // 接收用户的数据 返回token
  const { body } = ctx.request
  const sid = body.sid
  const code = body.code
  // 验证图片验证码的时效性、准确性
  const result = await checkCode(sid, code)
  if (result) {
    let checkUserPasswd = false
    const user = await User.findOne({ email: body.email })
    // 判断邮箱是否注册
    if (user) {
      // 验证用户账号密码是否正确
      if (await bcrypt.compare(body.password, user.password)) {
        checkUserPasswd = true
      }
      // mongoDB 查库
      if (checkUserPasswd) {
        // 验证通过 返回 Token数据
        const token = jwt.sign({ _id: 'lxl' }, JWT_SECRET, {
          expiresIn: '1d'
        })
        ctx.body = {
          code: 200,
          token: token,
          data: user
        }
      } else {
        // 用户名密码验证失败, 返回提示
        ctx.body = {
          code: 404,
          msg: '用户名或密码错误'
        }
      }
    } else {
      ctx.body = {
        code: 404,
        msg: '该邮箱未绑定账号, 请确认'
      }
    }
  } else {
    // 图片验证码校验失败
    ctx.body = {
      code: 401,
      msg: '图片验证码不正确, 请检查'
    }
  }
}

/**
 *
 * @param {*} sid 随机串 与图形验证码 关联
 * @param {*} code 图形验证码
 * @param {*} email  邮箱
 * @param {*} password 密码
 * @param {*} username 姓名 用户名 昵称
 */
export const Register = async(ctx, next) => {
  // 接收客户端的数据
  const { body } = ctx.request
  console.log(body)
  // 校验验证码的内容 (时效性、有效性)
  const sid = body.sid // uuid
  const code = body.code
  const msg = {}
  // 验证图片验证码的时效性、正确性
  const result = await checkCode(sid, code)
  let check = true
  if (result) {
    // 查库，看email是否被注册
    const email = await User.findOne({ email: body.email })
    if (email !== null && typeof email.email !== 'undefined') {
      msg.email = ['此邮箱已经注册，可以通过邮箱找回密码']
      check = false
    }
    // 查库，看name是否被注册
    const username = await User.findOne({ username: body.username })
    if (username !== null && typeof username.username !== 'undefined') {
      msg.username = ['此昵称已经被注册，请修改']
      check = false
    }

    // 写入数据到数据库
    if (check) {
      body.password = await bcrypt.hash(body.password, 5)
      const user = new User({
        email: body.email,
        username: body.username,
        password: body.password,
        created: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      const result = await user.save()
      ctx.body = {
        code: 200,
        data: result,
        msg: '注册成功'
      }
      return
    }
  } else {
    msg.code = ['验证码已经失效，请重新获取！']
  }
  ctx.body = {
    code: 500,
    msg: msg
  }
}

export const SendMial = async(ctx) => {
  try {
    const result = await sendMail({
      code: '1234',
      expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
      email: '13290731298@163.com',
      user: 'lxl'
    })
    ctx.body = {
      code: 200,
      data: result,
      msg: '邮件发送成功'
    }
  } catch (e) {
    console.log(e)
  }
}
