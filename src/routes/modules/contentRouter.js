import Router from 'koa-router'
import { getPostList, getLinks, getTips, getTopWeek } from '@/controller/contentController'

const router = new Router()
router.prefix('/public')
// 获取文章列表
router.get('/list', getPostList)
// 查询友链
router.get('/links', getLinks)
// 查询温馨提醒
router.get('/tips', getTips)
// 本周热议
router.get('/topWeek', getTopWeek)

export default router
