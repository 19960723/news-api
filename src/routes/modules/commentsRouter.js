import Router from 'koa-router'
import { addComment, updateComment, setBest, setHands } from '@/controller/commentsController'

const router = new Router()
router.prefix('/comments')
// 添加评论
router.post('/addReply', addComment)
// 评论点赞
router.get('/hands', setHands)
// 更新评论
router.post('/update', updateComment)
// 设置最佳答案
router.post('/accept', setBest)

export default router
