import Router from 'koa-router'
import { uploadImg } from '@/controller/contentController'

const router = new Router()
router.prefix('/content')
router.post('/upload', uploadImg)

export default router
