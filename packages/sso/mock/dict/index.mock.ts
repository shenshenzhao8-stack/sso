import { SUCCESS_CODE } from '../../src/constants'

const timeout = 1000

const dictObj: Recordable = {
  importance: [
    {
      value: 0,
      label: 'tableDemo.commonly'
    },
    {
      value: 1,
      label: 'tableDemo.good'
    },
    {
      value: 2,
      label: 'tableDemo.important'
    }
  ]
}

export default [
  // 字典接口
  {
    url: '/mock/dict/list',
    method: 'get',
    timeout,
    rawResponse: async (req: any, res: any) => {
      const data = { code: SUCCESS_CODE, data: dictObj }
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.statusCode = 200
      res.end(JSON.stringify(data))
    }
  },
  // 获取某个字典
  {
    url: '/mock/dict/one',
    method: 'get',
    timeout,
    rawResponse: async (req: any, res: any) => {
      const data = {
        code: SUCCESS_CODE,
        data: [
          { label: 'test1', value: 0 },
          { label: 'test2', value: 1 },
          { label: 'test3', value: 2 }
        ]
      }
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.statusCode = 200
      res.end(JSON.stringify(data))
    }
  }
]
