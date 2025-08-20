import request from '@/axios'
import type { UserLoginType, UserType, UserListType, IParamsGetToken } from './types'

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
 * 使用短链获取双 token
 */
export const getToken = (ticket: string) => {
  return request.post({
    url: '/manager/ticket-analysis',
    data: {
      ticket
    }
  })
}
