import { toAnyString } from '../../src/utils'
import Mock from 'mockjs'
import { handleCorsResponse, createMockResponse } from '../corsHandler'

const departmentList: any = []

const citys = ['厦门总公司', '北京分公司', '上海分公司', '福州分公司', '深圳分公司', '杭州分公司']

for (let i = 0; i < 5; i++) {
  departmentList.push({
    // 部门名称
    departmentName: citys[i],
    id: toAnyString(),
    createTime: '@datetime',
    // 状态
    status: Mock.Random.integer(0, 1),
    // 备注
    remark: '@cword(10, 15)',
    children: [
      {
        // 部门名称
        departmentName: '研发部',
        id: toAnyString(),
        createTime: '@datetime',
        // 状态
        status: Mock.Random.integer(0, 1),
        // 备注
        remark: '@cword(10, 15)'
      },
      {
        // 部门名称
        departmentName: '产品部',
        id: toAnyString(),
        createTime: '@datetime',
        // 状态
        status: Mock.Random.integer(0, 1),
        // 备注
        remark: '@cword(10, 15)'
      },
      {
        // 部门名称
        departmentName: '运营部',
        id: toAnyString(),
        createTime: '@datetime',
        // 状态
        status: Mock.Random.integer(0, 1),
        // 备注
        remark: '@cword(10, 15)'
      },
      {
        // 部门名称
        departmentName: '市场部',
        id: toAnyString(),
        createTime: '@datetime',
        // 状态
        status: Mock.Random.integer(0, 1),
        // 备注
        remark: '@cword(10, 15)'
      },
      {
        // 部门名称
        departmentName: '销售部',
        id: toAnyString(),
        createTime: '@datetime',
        // 状态
        status: Mock.Random.integer(0, 1),
        // 备注
        remark: '@cword(10, 15)'
      },
      {
        // 部门名称
        departmentName: '客服部',
        id: toAnyString(),
        createTime: '@datetime',
        // 状态
        status: Mock.Random.integer(0, 1),
        // 备注
        remark: '@cword(10, 15)'
      }
    ]
  })
}

export default [
  // 列表接口
  {
    url: '/mock/department/list',
    method: 'get',
    rawResponse: async (req: any, res: any) => {
      const data = createMockResponse({
        list: departmentList
      })
      handleCorsResponse(res, data)
    }
  },
  {
    url: '/mock/department/table/list',
    method: 'get',
    rawResponse: async (req: any, res: any) => {
      const data = createMockResponse({
        list: departmentList,
        total: 5
      })
      handleCorsResponse(res, data)
    }
  },
  {
    url: '/mock/department/users',
    method: 'get',
    timeout: 1000,
    rawResponse: async (req: any, res: any) => {
      const { pageSize = 30 } = req?.query || {}
      // 根据pageSize来创建数据
      const mockList: any = []
      for (let i = 0; i < pageSize; i++) {
        mockList.push(
          Mock.mock({
            // 用户名
            username: '@cname',
            // 账号
            account: '@first',
            // 邮箱
            email: '@EMAIL',
            // 创建时间
            createTime: '@datetime',
            // 用户id
            id: toAnyString()
          })
        )
      }
      const data = createMockResponse({
        total: 100,
        list: mockList
      })
      handleCorsResponse(res, data)
    }
  },
  // 保存接口
  {
    url: '/mock/department/user/save',
    method: 'post',
    timeout: 1000,
    rawResponse: async (req: any, res: any) => {
      const data = createMockResponse('success')
      handleCorsResponse(res, data)
    }
  },
  // 删除接口
  {
    url: '/mock/department/user/delete',
    method: 'post',
    rawResponse: async (req: any, res: any) => {
      const ids = req.body.ids
      if (!ids) {
        const data = createMockResponse({
          code: 500,
          message: '请选择需要删除的数据'
        })
        handleCorsResponse(res, data)
      } else {
        const data = createMockResponse('success')
        handleCorsResponse(res, data)
      }
    }
  },
  // 保存接口
  {
    url: '/mock/department/save',
    method: 'post',
    timeout: 1000,
    rawResponse: async (req: any, res: any) => {
      const data = createMockResponse('success')
      handleCorsResponse(res, data)
    }
  },
  // 删除接口
  {
    url: '/mock/department/delete',
    method: 'post',
    rawResponse: async (req: any, res: any) => {
      const ids = req.body.ids
      if (!ids) {
        const data = createMockResponse({
          code: 500,
          message: '请选择需要删除的数据'
        })
        handleCorsResponse(res, data)
      } else {
        const data = createMockResponse('success')
        handleCorsResponse(res, data)
      }
    }
  }
]
