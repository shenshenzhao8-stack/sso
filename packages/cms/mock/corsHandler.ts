import { SUCCESS_CODE } from '../src/constants'

// 封装跨域响应处理函数
export const handleCorsResponse = (res: any, data: any) => {
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(JSON.stringify(data))
}

// 封装通用的响应处理函数
export const createMockResponse = (data: any) => {
  return {
    code: SUCCESS_CODE,
    data
  }
}
