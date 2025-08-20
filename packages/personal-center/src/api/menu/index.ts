const routers = {
  code: 200,
  data: [
    {
      path: '/user-management/list',
      title: '用户管理',
      name: 'UserManagement',
      icon: 'mdi:user-multiple',
      children: null
    },
    {
      path: '/permission-management/list',
      title: '权限管理',
      name: 'PermissionManagement',
      icon: 'material-symbols:person-check-outline',
      children: null
    },
    {
      path: '/dictionary-configuration/list',
      title: '配置字典',
      name: 'DictionaryConfiguration',
      icon: 'material-symbols:settings-cinematic-blur-outline-sharp',
      children: [
        {
          path: 'contract/list',
          title: '合同归属',
          name: 'ContractList'
        },
        {
          path: 'l2department/list',
          title: 'L2部门',
          name: 'L2departmentList'
        },
        {
          path: 'project/list',
          title: '项目名称',
          name: 'ProjectList'
        }
      ]
    }
  ]
}

export const getMenuListApi = (): Promise<any> => {
  return new Promise((resolve) => {
    resolve(routers)
  })
}
