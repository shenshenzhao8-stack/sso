import { SUCCESS_CODE } from '../../src/constants'

const timeout = 1000

const List: {
  username: string
  password: string
  role: string
  roleId: string
  permissions: string | string[]
}[] = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin',
    roleId: '1',
    permissions: ['*.*.*']
  },
  {
    username: 'test',
    password: 'test',
    role: 'test',
    roleId: '2',
    permissions: ['example:dialog:create', 'example:dialog:delete']
  }
]

export default [
  // 列表接口
  {
    url: '/mock/user/list',
    method: 'get',
    rawResponse: async (req: any, res: any) => {
      const { username, pageIndex, pageSize } = req.query
      const mockList = List.filter((item) => {
        if (username && item.username.indexOf(username) < 0) return false
        return true
      })
      const pageList = mockList.filter(
        (_, index) => index < pageSize * pageIndex && index >= pageSize * (pageIndex - 1)
      )
      const data = { code: SUCCESS_CODE, data: { total: mockList.length, list: pageList } }
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.statusCode = 200
      res.end(JSON.stringify(data))
    }
  },
  // 登录接口
  {
    url: '/mock/user/login',
    method: 'post',
    timeout,
    rawResponse: async (req: any, res: any) => {
      const data = req.body
      let hasUser = false
      for (const user of List) {
        if (user.username === data.username && user.password === data.password) {
          hasUser = true
          const responseData = { code: SUCCESS_CODE, data: user }
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.statusCode = 200
          res.end(JSON.stringify(responseData))
          return
        }
      }
      if (!hasUser) {
        const errorData = { code: 500, message: '账号或密码错误' }
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.statusCode = 200
        res.end(JSON.stringify(errorData))
      }
    }
  },
  // 退出接口
  {
    url: '/mock/user/loginOut',
    method: 'get',
    timeout,
    rawResponse: async (req: any, res: any) => {
      const data = { code: SUCCESS_CODE, data: null }
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.statusCode = 200
      res.end(JSON.stringify(data))
    }
  }
]
