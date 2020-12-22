import Router from 'koa-router'
import { resTest } from '../controller/publicController'

const router = new Router()
router.prefix('/public')
router.get('/resTest', resTest)

export default router
