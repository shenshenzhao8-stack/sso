import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { Layout } from '@/utils/routerHelper'

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dimission-management/list',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'RedirectCon',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/dimission-management',
    component: Layout,
    redirect: '/dimission-management/list',
    name: 'DimissionManagement',
    meta: {
      title: '离职处理',
      icon: 'mdi:account-remove',
      alwaysShow: false
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/DimissionManagement/DimissionList/index.vue'),
        name: 'DimissionList',
        meta: {
          title: '列表',
          activeMenu: '/dimission-management',
          hidden: true
        }
      },
      {
        path: 'add',
        component: () => import('@/views/DimissionManagement/AddDimission/index.vue'),
        name: 'AddDimission',
        meta: {
          title: '新增',
          noTagsView: true,
          hidden: true,
          activeMenu: '/dimission-management'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/DimissionManagement/AddDimission/index.vue'),
        name: 'EditDimission',
        meta: {
          title: '编辑',
          hidden: true,
          noTagsView: true,
          activeMenu: '/dimission-management'
        }
      },
      {
        path: 'detail',
        component: () => import('@/views/DimissionManagement/AddDimission/index.vue'),
        name: 'DimissionDetail',
        meta: {
          title: '详情',
          hidden: true,
          noTagsView: true,
          activeMenu: '/dimission-management'
        }
      }
    ]
  },
  {
    path: '/error',
    component: Layout,
    redirect: '/error/404',
    name: 'Error',
    meta: {
      title: '错误页面',
      hidden: true
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
  history: createWebHistory('/human-resources'),
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export default router
