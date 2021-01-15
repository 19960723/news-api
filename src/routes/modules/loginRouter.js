import Router from 'koa-router'
import { Login, Register, Forget, Reset } from '@/controller/loginController'

const router = new Router()
router.prefix('/login')
// 登录接口
router.post('/login', Login)
// 注册接口
router.post('/register', Register)
// 忘记密码
router.post('/forget', Forget)
// 密码重置
router.post('/reset', Reset)

export default router
