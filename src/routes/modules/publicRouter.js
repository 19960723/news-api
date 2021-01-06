import Router from 'koa-router'
import { getCaptcha, getPostList, getLinks, getTips, getTopWeek, getPostDetail, test } from '@/controller/publicController'

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
//
router.get('/content/detail', getPostDetail)
// 测试
router.get('/test', test)

export default router
