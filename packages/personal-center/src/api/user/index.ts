import request from '@/axios'
import type { UserInfoType, PaginationInfoType } from '@/api/common/types'

/**
 * 获取用户列表
 * @param params
 * @returns
 */
export const getUserListApi = (params: {
  page: number
  limit: number
  search?: string
}): Promise<IResponse<{ list: UserInfoType[]; pagination: PaginationInfoType }>> => {
  return request.get({ url: '/manager/user/list', params })
}

/**
 * 获取用户信息
 * @param params
 * @returns
 */
export const getUserInfoApi = (params: { user_id: number }): Promise<IResponse<UserInfoType>> => {
  return request.get({ url: '/manager/user-center/get-user-detail', params })
}

/**
 * 导入用户
 * @param data
 * @returns
 */
export const insertUserApi = (data: { users: any[] }): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/user/insert', data })
}

/**
 * 删除用户
 * @param data
 * @returns
 */
export const deleteUserApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/user-center/delete-user', data })
}

/**
 *更新用户
 * @param data
 * @returns
 */
export const userUpdateApi = (data: any): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/user/update', data })
}

/**
 * 重置密码
 * @param data
 * @returns
 */
export const managerResetUserPasswordApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/user/initialize-pwd', data })
}
