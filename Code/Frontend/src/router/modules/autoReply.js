/*
 * chat Router配置表
 */
import Layout from '@/layout'

const asyncRouterMapAutoReply = {
  path: '/autoReply',
  component: Layout,
  redirect: '/autoReply/list',
  alwaysShow: true,
  name: 'autoReply',
  meta: {
    title: '自动回复',
    icon: 'service',
    permission: 'auto-reply.view',
    breadcrumb: false
  },
  children: [
    {
      path: '/autoReply/template',
      component: () => import('@/views/autoReply/template'),
      name: 'autoReply.template',
      meta: { title: '自动回复模板', icon: 'template-manage', permission: 'auto-reply.view' }
    },
    {
      path: '/autoReply/tools',
      component: () => import('@/views/autoReply/tools'),
      name: 'autoReply.tools',
      meta: { title: '辅助工具', icon: 'box', permission: 'lazada-operation.toolbar.auto-reply-rate' }
    },
    // ,
    // {
    //   path: '/autoReply/setUp',
    //   component: () => import('@/views/autoReply/setUp'),
    //   name: 'autoReply.setUp',
    //   meta: { title: '自动回复设置', icon: 'setting', permission: 'operation.auto-reply.auto-reply-set.list' }
    // }

    // {
    //   path: '/fans/add',
    //   component: () => import('@/views/fans/add'),
    //   name: 'fans.add',
    //   meta: { title: '粉丝添加', icon: 'fans_follow', permission: 'operation.follower.follower.add' }
    // }
  ]
}
export default asyncRouterMapAutoReply
