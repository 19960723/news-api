import Router from 'koa-router'
import { uploadImg, addPost, updatePost } from '@/controller/contentController'

const router = new Router()
router.prefix('/content')
// 上传图片
router.post('/upload', uploadImg)
// 发表新帖
router.post('/add', addPost)
// 更新帖子
router.post('/update', updatePost)
export default router
