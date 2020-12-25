import svgCaptcha from 'svg-captcha'
import { setValue } from '../db/RedisDB'

export const resTest = async(ctx, next) => {
  ctx.body = {
    message: 'hello world',
    code: 200
  }
}

export const getCaptcha = (ctx) => {
  const body = ctx.request.query
  const newCaptca = svgCaptcha.create({
    size: 4,
    ignoreChars: '0o1il',
    color: true,
    noise: Math.floor(Math.random() * 5),
    width: 150,
    height: 38
  })
  // 保存图片验证码数据, 设置超时时间, 单位 s
  // 设置图片验证码超时10分钟
  setValue(body.sid, newCaptca.text, 10 * 60)
  ctx.body = {
    code: 200,
    data: newCaptca.data
  }
}

export const test = async(ctx) => {
  const keys = { title: '不可一世', name: 'lxl', age: '23', link: 'http://www.baidu.com', src: 'https://i.pinimg.com/236x/54/87/a6/5487a6ceb6ac2c092fbf82ab435ee90c.jpg' }
  setValue('key2', keys)
  ctx.body = {
    code: 200,
    msg: 'hello'
  }
}
