import request from '@/axios'
import type { AddRoleDto } from './type'

/**
 * 获取角色列表
 * @param params
 * @returns
 */
export const getRoleListApi = (
  params: { page: number; limit: number } = { page: 1, limit: 30 }
) => {
  return request.get({ url: '/manager/permission/role-list', params: params })
}

/**
 * 获取所有权限
 * @returns
 */
export const getPermissionAllSelection = () => {
  return request.get({ url: '/manager/permission/all-selection' })
}

/**
 * 创建角色
 * @param data
 * @returns
 */
export const createRole = (data: AddRoleDto) => {
  return request.post({ url: '/manager/permission/create-role', data })
}

/**
 * 修改角色
 * @param data
 * @returns
 */
export const updateRole = (data: AddRoleDto) => {
  return request.put({ url: '/manager/permission/update-role', data })
}

/**
 * 删除角色
 * @param params
 * @returns
 */
export const deleteRole = (id: string) => {
  return request.delete({
    url: '/manager/permission/delete-role',
    data: {
      id
    }
  })
}

/**
 * 获取角色详情
 * @param params
 * @returns
 */
export const roleDetail = (id: string) => {
  return request.get({ url: '/manager/permission/role-detail', params: { id } })
}
