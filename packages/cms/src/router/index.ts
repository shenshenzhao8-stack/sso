import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { Layout } from '@/utils/routerHelper'
import { NO_RESET_WHITE_LIST } from '@/constants'

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
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
  // {
  //   path: '/login',
  //   component: () => import('@/views/Login/Login.vue'),
  //   name: 'Login',
  //   meta: {
  //     hidden: true,
  //     title: '登录',
  //     noTagsView: true
  //   }
  // },
  {
    path: '/error',
    component: () => import('@/App.vue'),
    redirect: '/error/404',
    name: 'Error',
    meta: {
      hidden: true,
      title: '错误页面',
      icon: 'ci:error',
      alwaysShow: true
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
        path: '500-demo',
        component: () => import('@/views/Error/500.vue'),
        name: '500Demo',
        meta: {
          title: '500'
        }
      }
    ]
  },
  {
    path: '/dashboard',
    component: Layout,
    name: 'Dashboard',
    meta: {
      title: '数据统计',
      icon: 'material-symbols:monitoring',
      alwaysShow: true
    },
    children: [
      {
        path: '',
        component: () => import('@/views/Dashboard/index.vue'),
        name: 'DashboardContent',
        meta: {
          title: '数据统计'
        }
      }
    ]
  },
  {
    path: '/banner-management',
    component: Layout,
    redirect: '/banner-management/list',
    name: 'BannerManagement',
    meta: {
      title: 'banner管理',
      icon: 'mdi:folder-question',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/BannerManagement/BannerList/index.vue'),
        name: 'BannerList',
        meta: {
          title: '列表',
          activeMenu: '/banner-management/list'
        }
      },
      {
        path: 'add',
        component: () => import('@/views/BannerManagement/AddBanner/index.vue'),
        name: 'AddBanner',
        meta: {
          title: '新增',
          noTagsView: true,
          activeMenu: '/banner-management/list'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/BannerManagement/AddBanner/index.vue'),
        name: 'EditBanner',
        meta: {
          title: '编辑',
          noTagsView: true,
          activeMenu: '/banner-management/list'
        }
      },
      {
        path: 'detail',
        component: () => import('@/views/BannerManagement/AddBanner/index.vue'),
        name: 'BannerDetail',
        meta: {
          title: '详情',
          hidden: true,
          noTagsView: true,
          activeMenu: '/banner-management/list'
        }
      }
    ]
  },
  {
    path: '/content-management',
    component: Layout,
    redirect: '/content-management/list',
    name: 'ContentManagement',
    meta: {
      title: '资讯内容管理',
      icon: 'mdi:folder-question',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/ContentManagement/ContentList/index.vue'),
        name: 'ContentList',
        meta: {
          title: '列表',
          activeMenu: '/content-management/list'
        }
      },
      {
        path: 'add',
        component: () => import('@/views/ContentManagement/AddContent/index.vue'),
        name: 'AddContent',
        meta: {
          title: '新增',
          noTagsView: true,
          activeMenu: '/content-management/list'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/ContentManagement/AddContent/index.vue'),
        name: 'EditContent',
        meta: {
          title: '编辑',
          noTagsView: true,
          activeMenu: '/content-management/list'
        }
      },
      {
        path: 'detail',
        component: () => import('@/views/ContentManagement/ContentDetail/index.vue'),
        name: 'ContentDetail',
        meta: {
          title: '详情',
          noTagsView: true,
          hidden: true,
          activeMenu: '/content-management/list'
        }
      }
    ]
  },
  {
    path: '/question-management',
    component: Layout,
    redirect: '/question-management/list',
    name: 'QuestionManagement',
    meta: {
      title: '题库管理',
      icon: 'mdi:folder-question',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/QuestionManagement/QuestionList/index.vue'),
        name: 'QuestionList',
        meta: {
          title: '题库',
          hidden: true,
          activeMenu: '/question-management/list'
        }
      },
      {
        path: 'add',
        component: () => import('@/views/QuestionManagement/AddQuestion/index.vue'),
        name: 'AddQuestion',
        meta: {
          title: '新增',
          noTagsView: true,
          hidden: true,
          activeMenu: '/question-management/list'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/QuestionManagement/AddQuestion/index.vue'),
        name: 'EditQuestion',
        meta: {
          title: '编辑',
          noTagsView: true,
          hidden: true,
          activeMenu: '/question-management/list'
        }
      },
      {
        path: 'detail',
        component: () => import('@/views/QuestionManagement/AddQuestion/index.vue'),
        name: 'QuestionDetail',
        meta: {
          title: '试题详情',
          noTagsView: true,
          hidden: true,
          activeMenu: '/question-management/list'
        }
      }
    ]
  },
  {
    path: '/examination-management',
    component: Layout,
    redirect: '/examination-management/examination-view',
    name: 'Examination',
    meta: {
      title: '信息安全考卷管理',
      icon: 'eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'add-examination',
        component: () => import('@/views/ExaminationManagement/AddExamination/AddExamination.vue'),
        name: 'AddExamination',
        meta: {
          title: '添加',
          noTagsView: true,
          noCache: true,
          hidden: true,
          canTo: true,
          activeMenu: '/examination-management/examination-view'
        }
      },
      {
        path: 'examination-view',
        component: () =>
          import('@/views/ExaminationManagement/ExaminationView/ExaminationView.vue'),
        name: 'ExaminationView',
        meta: {
          title: '考卷管理'
        }
      }
    ]
  },
  {
    path: '/training-management',
    component: Layout,
    redirect: '/training-management/training-view',
    name: 'TrainingManagement',
    meta: {
      title: '信息安全培训管理',
      icon: 'eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'add-training',
        component: () => import('@/views/TrainingManagement/AddTraining/AddTraining.vue'),
        name: 'AddTraining',
        meta: {
          title: '添加',
          noTagsView: true,
          noCache: true,
          hidden: true,
          canTo: true,
          activeMenu: '/training-management/training-view'
        }
      },
      {
        path: 'training-view',
        component: () => import('@/views/TrainingManagement/TrainingView/TrainingView.vue'),
        name: 'TrainingView',
        meta: {
          title: '培训管理'
        }
      }
    ]
  },
  {
    path: '/user-management',
    component: Layout,
    name: 'UserManagement',
    meta: {},
    children: [
      {
        path: '',
        component: () => import('@/views/UserManagement/index.vue'),
        name: 'UserManagementPage',
        meta: {
          title: '用户管理',
          icon: 'mdi:user-multiple'
        }
      }
    ]
  },
  {
    path: '/configuration-dictionary',
    component: Layout,
    redirect: '/configuration-dictionary/businessTags',
    name: 'ConfigurationDictionary',
    meta: {
      title: '配置字典',
      icon: 'eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'businessTags',
        component: () => import('@/views/ConfigurationDictionary/BusinessTags/BusinessTags.vue'),
        name: 'BusinessTags',
        meta: {
          title: '业务标签'
        }
      },
      {
        path: 'contentTags',
        component: () => import('@/views/ConfigurationDictionary/ContentTags/ContentTags.vue'),
        name: 'ContentTags',
        meta: {
          title: '内容标签'
        }
      }
    ]
  },
  {
    path: '/authorization',
    component: Layout,
    redirect: '/authorization/user',
    name: 'Authorization',
    meta: {
      title: '权限管理',
      icon: 'eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'department',
        component: () => import('@/views/Authorization/Department/Department.vue'),
        name: 'Department',
        meta: {
          title: '部门管理'
        }
      },
      {
        path: 'menu',
        component: () => import('@/views/Authorization/Menu/Menu.vue'),
        name: 'Menu',
        meta: {
          title: '菜单管理'
        }
      },
      {
        path: 'role',
        component: () => import('@/views/Authorization/Role/Role.vue'),
        name: 'Role',
        meta: {
          title: '角色管理'
        }
      }
    ]
  },
  {
    path: '/knowledge-management',
    component: Layout,
    redirect: '/knowledge-management/knowledge-view',
    name: 'knowledgeManagement',
    meta: {
      title: '资料库管理',
      icon: 'eos-icons:role-binding',
      alwaysShow: true
    },
    children: [
      {
        path: 'add-knowledge',
        component: () => import('@/views/knowledgeManagement/AddKnowledge/AddKnowledge.vue'),
        name: 'AddKnowledge',
        meta: {
          title: '添加',
          noTagsView: true,
          noCache: true,
          hidden: true,
          canTo: true,
          activeMenu: '/knowledge-management/knowledge-view'
        }
      },
      {
        path: 'knowledge-view',
        component: () => import('@/views/knowledgeManagement/KnowledgeView/KnowledgeView.vue'),
        name: 'KnowledgeView',
        meta: {
          title: '资料库'
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
  history: createWebHistory('/cms'),
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
