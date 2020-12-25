import Router from 'koa-router'
import { Login, Register, SendMial } from '../controller/loginController'

const router = new Router()
router.prefix('/user')
router.post('/login', Login)
router.post('/register', Register)
router.get('/send', SendMial)
export default router
