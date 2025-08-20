import request from '@/axios'
import type { UserType } from './types'

/**
 * 获取个人信息
 * @param params
 * @returns
 */
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
      ticket
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
