import Router from 'koa-router'
import { userSign, updateUserInfo, changePasswd, getUserInfo } from '@/controller/userController'
import { getPostByUid, deletePostByUid } from '@/controller/contentController'

const router = new Router()
router.prefix('/user')
// 用户签到
router.get('/fav', userSign)
// 修改密码
router.post('/changePassword', changePasswd)
// 获取用户基本信息
router.get('/info', getUserInfo)
// 更新用户的基本信息
router.post('/basic', updateUserInfo)
// 获取用户发帖记录
router.get('/mypost', getPostByUid)
// 删除发帖纪录
router.get('/deletePost', deletePostByUid)

export default router
