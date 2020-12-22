import Router from 'koa-router'
import { Login, Register } from '../controller/loginController'

const router = new Router()
router.prefix('/user')
router.post('/login', Login)
router.post('/register', Register)
export default router
