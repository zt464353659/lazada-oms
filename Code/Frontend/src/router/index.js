import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import { routerConfig } from './config'
import asyncRouterMapChat from './modules/chat'
import asyncRouterMapAutoReply from './modules/autoReply'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRouterMap
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRouterMap = [
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  }
  /* 一级菜单配置 */
  // {
  //   path: '/message',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: '消息管理',
  //       component: () => import('@/views/message/index'),
  //       meta: { title: '消息管理', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
]
export const asyncRouterMap = [
  {
    path: '/system',
    component: Layout,
    alwaysShow: true, // will always show the root menu
    meta: {
      title: '系统',
      icon: 'settings',
      permission: 'system.view',
      breadcrumb: false
    },
    children: [
      {
        path: '/system/permission',
        component: () => import('@/views/system/permission'),
        name: 'system.permission',
        // alwaysShow: true, // will always show the root menu
        meta: { title: '权限管理', icon: 'setting', permission: 'lazada-operation.manager.permission.list' }
      }]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/manage',
    alwaysShow: true,
    name: 'user',
    meta: {
      title: '用户',
      icon: 'users',
      permission: 'user.view',
      breadcrumb: false
    },
    children: [
      {
        path: '/user/user',
        name: 'user.user',
        component: () => import('@/views/user/manage'),
        meta: { title: '用户管理', icon: 'user-manage', permission: 'lazada-operation.manager.user.list' }
      },
      {
        path: '/user/role',
        name: 'user.role',
        component: () => import('@/views/user/role'),
        meta: { title: '角色管理', icon: 'role', permission: 'lazada-operation.manager.role.list' }
      }
    ]
  },
  {
    path: '/account',
    component: Layout,
    redirect: '/account/manage',
    name: 'account',
    alwaysShow: true,
    meta: {
      title: '账号',
      icon: 'account',
      permission: 'account.view',
      breadcrumb: false
    },
    children: [
      {
        path: '/account/manage',
        name: 'account.manage',
        component: () => import('@/views/account/manage'),
        meta: { title: '账号管理', icon: 'user-manage', permission: 'lazada-operation.account.list' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

if (routerConfig) {
  if (routerConfig['chat']) {
    asyncRouterMap.push(asyncRouterMapChat)
  }
  if (routerConfig['autoReply']) {
    asyncRouterMap.push(asyncRouterMapAutoReply)
  }
}

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
