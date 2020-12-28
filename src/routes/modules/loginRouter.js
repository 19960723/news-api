import Router from 'koa-router'
import { Login, Register, Forget, SendMial, Reset } from '@/controller/loginController'

const router = new Router()
router.prefix('/user')
// 登录接口
router.post('/login', Login)
// 注册接口
router.post('/register', Register)
// 忘记密码
router.post('/forget', Forget)
// 发送邮箱
router.get('/send', SendMial)
// 密码重置
router.get('/reset', Reset)

export default router
