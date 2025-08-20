import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory
} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { NO_RESET_WHITE_LIST } from '@/constants'

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/user-management',
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
    path: '/user-management',
    component: Layout,
    name: 'UserManagement',
    redirect: '/user-management/list',
    meta: {
      title: '用户管理',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/UserManagement/List/index.vue'),
        name: 'UserManagementList',
        meta: {
          title: '用户管理',
          icon: 'mdi:user-multiple',
          activeMenu: '/user-management'
        }
      },
      {
        path: 'add',
        component: () => import('@/views/UserManagement/Add/index.vue'),
        name: 'AddUser',
        meta: {
          title: '新增用户',
          icon: 'mdi:user-multiple',
          activeMenu: '/user-management'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/UserManagement/Add/index.vue'),
        name: 'EditUser',
        meta: {
          title: '编辑用户',
          icon: 'mdi:user-multiple',
          activeMenu: '/user-management'
        }
      }
    ]
  },
  {
    path: '/department-management',
    component: Layout,
    name: 'DepartmentManagement',
    redirect: '/department-management/list',
    meta: {
      title: '部门管理',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/Department/index.vue'),
        name: 'DepartmentManagementList',
        meta: {
          title: '部门管理',
          icon: 'material-symbols:account-tree',
          activeMenu: '/department-management'
        }
      }
    ]
  },
  {
    path: '/permission-management',
    component: Layout,
    redirect: '/permission-management/list',
    name: 'PermissionManagement',
    meta: {
      title: '权限管理',
      icon: 'material-symbols:person-check-outline',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/PermissionManagement/List/index.vue'),
        name: 'PermissionManagementList',
        meta: {
          title: '权限管理',
          activeMenu: '/permission-management'
        }
      },
      {
        path: 'add',
        component: () => import('@/views/PermissionManagement/Add/index.vue'),
        name: 'AddPermission',
        meta: {
          title: '新增权限',
          activeMenu: '/permission-management'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/PermissionManagement/Add/index.vue'),
        name: 'EditPermission',
        meta: {
          title: '编辑权限',
          activeMenu: '/permission-management'
        }
      }
    ]
  },
  {
    path: '/dictionary-configuration',
    component: Layout,
    redirect: '/dictionary-configuration/contract/list',
    name: 'DictionaryConfiguration',
    meta: {
      title: '配置字典',
      icon: 'material-symbols:settings-cinematic-blur-outline-sharp',
      alwaysShow: true
    },
    children: [
      {
        path: 'contract/list',
        component: () => import('@/views/DictionaryManagement/Contract/index.vue'),
        name: 'ContractList',
        meta: {
          title: '合同归属'
        }
      },
      // {
      //   path: 'l2department/list',
      //   component: () => import('@/views/DictionaryManagement/L2Department/index.vue'),
      //   name: 'L2departmentList',
      //   meta: {
      //     title: 'L2部门'
      //   }
      // },
      {
        path: 'project/list',
        component: () => import('@/views/DictionaryManagement/Project/index.vue'),
        name: 'ProjectList',
        meta: {
          title: '项目名称'
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
  history: createWebHistory('/personal-center'),
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export default router
