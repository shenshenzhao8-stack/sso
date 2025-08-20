import request from '@/axios'
import type { DepartmentItem } from '@/api/department/types'
import type { UserInfoType } from '@/api/common/types'

/**
 * 获取部门层级列表
 * @param params
 * @returns
 */
export const getDepartmentLevelListApi = (params?: {
  parent_id: number
}): Promise<IResponse<{ result: DepartmentItem[]; current_user_department: DepartmentItem }>> => {
  return request.get({ url: '/manager/user-center/get-department-level-list', params })
}

/**
 * 获取部门详情
 * @param params
 * @returns
 */
export const getDepartmentDetailApi = (params: {
  id: number
}): Promise<IResponse<{ department: DepartmentItem; department_level_ids: number[] }>> => {
  return request.get({ url: '/manager/user-center/get-department', params })
}

/**
 * 创建部门
 * @param data head_user: 负责人id, level: 职级（1，2，3，4，5）, name: 部门名称, parent_department_id: 上级部门id
 * @returns
 */
export const createDepartmentApi = (data: any): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/manager/user-center/create-department', data })
}

/**
 * 删除部门
 * @param data
 * @returns
 */
export const deleteDepartmentApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/user-center/delete-department', data })
}

/**
 * 更新部门
 * @param data
 * @returns
 */
export const updateDepartmentApi = (data: any): Promise<IResponse<{ id: number }>> => {
  return request.put({ url: '/manager/user-center/update-department', data })
}

/**
 * 获取人员列表
 * @param params user_type:1: 普通用户，2: 评审人员
 * @returns
 */
export const getUserListApi = (params: {
  name?: string
  user_type: number
}): Promise<IResponse<{ result: UserInfoType[] }>> => {
  return request.get({ url: '/manager/user-center/get-user-list', params })
}
