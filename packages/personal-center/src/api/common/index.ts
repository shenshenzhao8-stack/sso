import request from '@/axios'
import type { UserInfoType } from '@/api/common/types'

/**
 * 获取导入模版
 * @param params type:1: 用户录入 2: 其他
 * @returns
 */
export const getFileTemplateApi = (params: { type: number }): Promise<IResponse<any>> => {
  return request.get({ url: '/manager/file/template', params, responseType: 'blob' })
}

/**
 * 检查用户是否存在
 * @param data
 * @returns
 */
export const checkUserExistApi = (data: {
  emails: string[]
}): Promise<IResponse<{ exits?: UserInfoType[] }>> => {
  return request.post({ url: '/manager/users-check', data })
}
