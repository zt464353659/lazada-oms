/*
 * chat Router配置表
 */
import Layout from '@/layout'

const asyncRouterMapChat = {
  path: '/chat',
  component: Layout,
  redirect: '/chat/list',
  alwaysShow: true,
  name: 'chat',
  meta: {
    title: '聊聊',
    icon: 'wechat',
    permission: 'shopnews.view',
    breadcrumb: false
  },
  children: [
    {
      path: '/chat/list',
      component: () => import('@/views/chat/list'),
      name: 'chat.list',
      meta: { title: '聊聊管理', icon: 'message', permission: 'chat.view' }
    },
    {
      path: '/chat/orders',
      component: () => import('@/views/chat/orders'),
      name: 'chat.orders',
      meta: { title: '订单', icon: 'manage-order', permission: 'lazada-operation.web-service.istore-order.order-list' }
    },
    {
      path: '/chat/tools',
      component: () => import('@/views/chat/tools'),
      name: 'chat.tools',
      meta: { title: '辅助工具', icon: 'box', permission: 'lazada-operation.toolbar.export-store-performance' }
    },
    {
      path: '/chat/notice',
      component: () => import('@/views/chat/notice'),
      name: 'chat.notice',
      hidden: true,
      meta: { title: '通知管理', icon: 'message1', permission: 'operation.shop-news.shop-news.list' }
    },
    {
      path: '/chat/no-payment',
      component: () => import('@/views/chat/nopayment'),
      name: 'chat.nopayment',
      hidden: true,
      meta: { title: '待付款提示', icon: 'nopayment', permission: 'operation.chat.auto-tips.list' }
    },
    {
      path: '/chat/bargain',
      component: () => import('@/views/chat/bargain.vue'),
      name: 'chat.bargain',
      hidden: true,
      meta: { title: '议价设置', icon: 'bargain', permission: 'operation.chat.discuss-price.list' }
    }
  ]
}
export default asyncRouterMapChat
