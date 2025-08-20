import request from '@/axios'
import type { UserLoginType, UserType, UserListType } from './types'
import { localStorageHelper } from '@ff/utils'
import { EToken } from '@/enum'
import { canRouterMap } from '@ff/config'
import _ from 'lodash'

interface RoleParams {
  roleName: string
}

export const loginApi = (
  data: UserLoginType
): Promise<IResponse<{ token: string; refresh_token: string }>> => {
  return request.post({ url: '/manager/login', data })
}

export const getUserInfoApi = (params: { user_id?: string }): Promise<IResponse<UserType>> => {
  return request.get({ url: '/manager/get', params })
}

export const sendCodeApi = (data: { email: string }): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/send-code', data })
}

export const resetPasswordApi = (data: {
  email: string
  password: string
  old_password?: string
  code: number
}): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/reset-pwd', data })
}

/**
 *
 * @param params type:1: 用户录入 2: 其他
 * @returns
 */
export const getFileTemplateApi = (params: { type: number }): Promise<IResponse<any>> => {
  return request.get({ url: '/manager/file/template', params, responseType: 'blob' })
}

export const getUserListApi = (params: {
  page: number
  limit: number
  search?: string
}): Promise<IResponse<UserListType>> => {
  return request.get({ url: '/manager/user/list', params })
}

export const checkUserExistApi = (data: {
  emails: string[]
}): Promise<IResponse<{ exits?: UserType[] }>> => {
  return request.post({ url: '/manager/users-check', data })
}

export const addUserApi = (data: {
  users: { email: string; name: string; [key: string]: any }[]
}): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/user/insert', data })
}

/**
 *
 * @param data status 1:在职 2:离职
 * @returns
 */
export const userUpdateApi = (data: {
  id: number
  name?: string
  status?: number
}): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/user/update', data })
}

export const managerResetUserPasswordApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/user/initialize-pwd', data })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/mock/user/loginOut' })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}

/**
 * 刷新token
 * @returns
 */
export const refreshToken = (data: { refresh_token: string }) => {
  return request.post({ url: '/manager/refresh-token', data })
}

/**
 * 生成短链 /manager/gen-ticket
 */

export const getTicket = () => {
  const token = localStorageHelper.get(EToken.TOKEN)
  const refreshToken = localStorageHelper.get(EToken.REFRESH_TOKEN)
  return request.post({
    url: '/manager/gen-ticket',
    data: {
      access_token: token,
      refresh_token: refreshToken
    }
  })
}

/**
 * 获取顶部路由
 */
export const getTopMenu = async () => {
  const obj = await request
    .get({ url: '/manager/user-center/get-user-permission-list' })
    .then((res) => {
      const arr1 = canRouterMap(import.meta.env.MODE as any).items
      const arr2 = res.data.result

      // 获取数组 1 中所有的 key
      const keysInArray1 = _.map(arr1, 'key')

      // 过滤掉数组 2 中 server_code 不在数组 1 的 key 中的对象
      const filteredArray2 = _.filter(arr2, (item) => _.includes(keysInArray1, item.server_code))

      // 合并数组
      const mergedArray = _.filter(arr1, (item1) => {
        const matchingItem = _.find(filteredArray2, { server_code: item1.key })
        return matchingItem
      })

      return {
        code: res.code,
        data: mergedArray || []
      }
    })

  return obj
}
