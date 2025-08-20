import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export const constantRouterMap: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/Login/Login.vue'),
    name: 'login',
    meta: {
      hidden: true
    }
  },
  {
    path: '/home',
    component: () => import('@/views/Home/index.vue'),
    name: 'home',
    meta: {
      hidden: true
    }
  },
  {
    path: '/error',
    name: 'Error',
    redirect: '/error/404',
    component: () => import('@/views/Home/index.vue'),
    meta: {
      title: '错误页面'
    },
    children: [
      {
        path: '404',
        component: () => import('@/views/Error/404.vue'),
        name: '404Demo',
        meta: {
          title: '404'
        }
      },
      {
        path: '403',
        component: () => import('@/views/Error/403.vue'),
        name: '403Demo',
        meta: {
          title: '403'
        }
      },
      {
        path: '500',
        component: () => import('@/views/Error/500.vue'),
        name: '500Demo',
        meta: {
          title: '500'
        }
      }
    ]
  },
  // 将404路由移到最后,确保能匹配所有未定义路由
  {
    path: '/:pathMatch(.*)', // 移除多余的*号,使用单个*来匹配所有路径
    name: 'notFound',
    component: () => import('@/views/Error/404.vue'), // 直接指向404组件而不是重定向
    meta: {
      hidden: true
    }
  }
]

const router = createRouter({
  history: createWebHistory('/sso'),
  routes: constantRouterMap,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export default router
