import Router from 'koa-router'
import { getCaptcha, getPostList, getLinks, getTips, getTopWeek, getPostDetail } from '@/controller/publicController'
import { getComments } from '@/controller/commentsController'
import { resetEmail } from '@/controller/userController'

const router = new Router()
router.prefix('/public')
// 获取图形验证码
router.get('/getCaptcha', getCaptcha)
// 获取文章列表
router.get('/list', getPostList)
// 查询友链
router.get('/links', getLinks)
// 查询温馨提醒
router.get('/tips', getTips)
// 本周热议
router.get('/topWeek', getTopWeek)
// 详情页
router.get('/content/detail', getPostDetail)
// 获取评论列表
router.get('/comments', getComments)
// 确认修改邮箱
router.get('/resetEmail', resetEmail)

export default router
