import Router from 'koa-router'
import { resTest, getCaptcha, test } from '../controller/publicController'

const router = new Router()
router.prefix('/public')
router.get('/resTest', resTest)
router.get('/getCaptcha', getCaptcha)
router.get('/test', test)

export default router
