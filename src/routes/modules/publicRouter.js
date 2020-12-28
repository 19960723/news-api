import Router from 'koa-router'
import { getCaptcha, test } from '@/controller/publicController'

const router = new Router()
router.prefix('/public')
// 获取图形验证码
router.get('/getCaptcha', getCaptcha)
router.get('/test', test)

export default router
