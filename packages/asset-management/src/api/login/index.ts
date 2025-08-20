import request from '@/axios'
import type { UserType, IParamsGetToken } from './types'

interface RoleParams {
  roleName: string
}

export const loginApi = (data: UserType): Promise<IResponse<UserType>> => {
  return request.post({ url: '/mock/user/login', data })
}

export const loginOutApi = (): Promise<IResponse> => {
  return request.get({ url: '/mock/user/loginOut' })
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    code: string
    data: {
      list: UserType[]
      total: number
    }
  }>({ url: '/mock/user/list', params })
}

export const getAdminRoleApi = (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  return request.get({ url: '/mock/role/list', params })
}

export const getTestRoleApi = (params: RoleParams): Promise<IResponse<string[]>> => {
  return request.get({ url: '/mock/role/list2', params })
}

export const getUserInfoApi = (params: { user_id?: string }): Promise<IResponse<UserType>> => {
  return request.get({ url: '/manager/get', params })
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
      ticket: ticket
    }
  })
}

/**
 * 发送验证码
 * @param data
 * @returns
 */
export const sendCodeApi = (data: { email: string }): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/send-code', data })
}

/**
 * 重置密码
 * @param data
 * @returns
 */
export const resetPasswordApi = (data: {
  email: string
  password: string
  old_password?: string
  code: number
}): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/reset-pwd', data })
}
