import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { NO_RESET_WHITE_LIST } from '@/constants'

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/assets',
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
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets/fixed',
    name: 'assets',
    meta: {
      title: '资产列表',
      icon: 'ant-design:dashboard-filled',
      alwaysShow: true
    },
    children: [
      {
        path: 'fixed',
        component: () => import('@/views/assets-fixed/index.vue'),
        name: 'fixed',
        meta: {
          title: '固定资产列表',
          noCache: true,
          affix: true
        }
      },
      {
        path: 'add',
        component: () => import('@/views/assets-fixed/add.vue'),
        name: 'fixed-add',
        meta: {
          title: '新增固定资产',
          hidden: true,
          activeMenu: '/assets/fixed',
          ignorePermission: true,
          breadcrumb: false,
          noTagsView: true
        }
      },
      {
        path: ':id/detail',
        component: () => import('@/views/assets-fixed/detail.vue'),
        name: 'fixed-detail',
        meta: {
          title: '固定资产详情',
          hidden: true,
          activeMenu: '/assets/fixed',
          ignorePermission: true,
          inheritRoutePermissions: 'fixed',
          breadcrumb: false,
          noTagsView: true
        }
      },
      {
        path: 'consumables',
        component: () => import('@/views/assets-consumables/index.vue'),
        name: 'consumables',
        meta: {
          title: '消耗品列表',
          noCache: true
        }
      },
      {
        path: 'consumables-add',
        component: () => import('@/views/assets-consumables/add.vue'),
        name: 'consumables-add',
        meta: {
          title: '新增消耗品',
          hidden: true,
          activeMenu: '/assets/consumables',
          ignorePermission: true,
          breadcrumb: false,
          noTagsView: true
        }
      },
      {
        path: ':id/consumables-detail',
        component: () => import('@/views/assets-consumables/detail.vue'),
        name: 'consumables-detail',
        meta: {
          title: '消耗品详情',
          hidden: true,
          activeMenu: '/assets/consumables',
          ignorePermission: true,
          inheritRoutePermissions: 'consumables',
          breadcrumb: false,
          noTagsView: true
        }
      }
    ]
  },
  {
    path: '/permissions',
    redirect: '/permissions/index',
    component: Layout,
    name: 'permissions',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/permissions/index.vue'),
        name: 'permissions-index',
        meta: {
          title: '权限管理',
          icon: 'mdi:user-multiple'
        }
      }
    ]
  },
  {
    path: '/configuration-dictionary',
    redirect: '/configuration-dictionary/index',
    component: Layout,
    name: 'configuration-dictionary',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/configuration-dictionary/index.vue'),
        name: 'configuration-dictionary-index',
        meta: {
          title: '配置字典',
          icon: 'eos-icons:role-binding'
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
  history:
    import.meta.env.VITE_APP_HASH_ROUTER === 'true'
      ? createWebHashHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export default router
