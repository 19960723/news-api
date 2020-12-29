import Router from 'koa-router'
import { userSign, updateUserInfo, changePasswd } from '@/controller/userController'

const router = new Router()
router.prefix('/user')
// 用户签到
router.get('/fav', userSign)
// 更新用户的基本信息
router.get('/basic', updateUserInfo)
// 修改密码
router.post('/change-passwd', changePasswd)
export default router
