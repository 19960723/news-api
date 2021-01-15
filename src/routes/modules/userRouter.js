import Router from 'koa-router'
import { userSign, updateUserInfo, changePasswd, getUserInfo, setCollect, getCollectByUid } from '@/controller/userController'
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
// 取消 设置收藏
router.get('/setCollect', setCollect)
// 获取收藏列表
router.get('/collect', getCollectByUid)

export default router
