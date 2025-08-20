import request from '@/axios'
import type { RoleItemType, RolePermissionsInfoType } from './types'
import type { PaginationInfoType } from '@/api/common/types'

/**
 * 获取角色列表
 * @param params
 * @returns
 */
export const getRoleListApi = (params: {
  page: number
  limit: number
  name?: string
}): Promise<IResponse<{ result: RoleItemType[]; pagination: PaginationInfoType }>> => {
  return request.get({ url: '/manager/user-center/get-role-list', params })
}

/**
 * 删除角色
 * @param data
 * @returns
 */
export const deleteRoleApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/user-center/delete-role', data })
}

/**
 * 创建角色
 * @param data
 * @returns
 */
export const createRoleApi = (data: any): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/manager/user-center/create-role', data })
}

/**
 * 获取角色详情
 * @param params
 * @returns
 */
export const getRoleDetailApi = (params: { id: number }): Promise<IResponse<RoleItemType>> => {
  return request.get({ url: '/manager/user-center/get-role', params })
}

/**
 * 更新角色
 * @param data
 * @returns
 */
export const updateRoleApi = (data: any): Promise<IResponse<{ id: number }>> => {
  return request.put({ url: '/manager/user-center/update-role', data })
}

/**
 * 获取角色所有的权限列表
 * @returns
 */
export const getRolePermissionListApi = (): Promise<
  IResponse<{ result: RolePermissionsInfoType[] }>
> => {
  return request.get({ url: '/manager/user-center/get-role-permission-list' })
}

/**
 * 获取角色选择的权限列表
 * @returns
 */
export const getUserPermissionListApi = (): Promise<
  IResponse<{ result: RolePermissionsInfoType[] }>
> => {
  return request.get({ url: '/manager/user-center/get-user-permission-list' })
}
