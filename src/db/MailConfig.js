'use strict'
import nodemailer from 'nodemailer'
import { mailKey } from '../config'
const url = 'http://123.56.45.69'

async function sendMail(sendInfo) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // qq邮箱
    port: 587, // 端口
    secure: false, // true for 465, false for other ports
    auth: {
      user: '1847426505@qq.com', // 发件人邮箱
      pass: mailKey // 发件人邮箱的授权码
    }
  })

  const info = await transporter.sendMail({
    from: '"林小龙 👻" <1847426505@qq.com>', // 发件人 邮箱  '昵称<发件人邮箱>'
    to: sendInfo.email, // 收件人的邮箱 可以是其它运营商的邮箱
    subject: // 主题
      sendInfo.user === ''
        ? '注册码'
        : `你好开发者,${sendInfo.user}！注册码`,
    text: // 内容
      `您在ss中注册，您的邀请码是${
        sendInfo.code
      },邀请码的过期时间: ${sendInfo.expire}
      `,
    html: // 这里可以添加 html 标签内容
      `<div style="border: 1px solid #dcdcdc;color: #676767;width: 600px; margin: 0 auto; padding-bottom: 50px;position: relative;">
          <div style="height: 60px; background: #393d49; line-height: 60px; color: #58a36f; font-size: 18px;padding-left: 10px;">Imooc社区——欢迎来到官方社区</div>
          <div style="padding: 25px">
            <div>您好，${sendInfo.user}童鞋，重置链接有效时间30分钟，请在${
  sendInfo.expire
}之前重置您的密码：</div>
            <a href="${url}" style="padding: 10px 20px; color: #fff; background: #009e94; display: inline-block;margin: 15px 0;">立即重置密码</a>
            <div style="padding: 5px; background: #f2f2f2;">如果该邮件不是由你本人操作，请勿进行激活！否则你的邮箱将会被他人绑定。</div>
          </div>
          <div style="background: #fafafa; color: #b4b4b4;text-align: center; line-height: 45px; height: 45px; position: absolute; left: 0; bottom: 0;width: 100%;">系统邮件，请勿直接回复</div>
      </div>`
  })
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  return 'Message sent: %s' + info.messageId
}

// main().catch(console.error)

export default sendMail
