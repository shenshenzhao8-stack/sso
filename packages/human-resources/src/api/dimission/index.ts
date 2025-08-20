import request from '@/axios'
import type { PaginationType } from '@/api/common/types'
import type { DictItemType, ResignationItemType, UserInfoType } from '@/api/dimission/types'

/**
 * 根据类型获取字典列表
 * @param params type：1员工类型，2离职类型
 * @returns
 */
export const getDictListApi = (params: {
  type: number
}): Promise<IResponse<{ result: DictItemType[] }>> => {
  return request.get({ url: '/manager/hr-manager/dict/get-dict-by-type-list', params })
}

/**
 * 获取合同归属列表
 * @returns
 */
export const getContractListApi = (): Promise<IResponse<{ result: DictItemType[] }>> => {
  return request.get({ url: '/manager/hr-manager/dict/get-dict-contract-list' })
}

/**
 * 获取离职信息列表
 * @param params
 * @returns
 */
export const getResignationListApi = (params: {
  resignation_type_ids?: number[]
  resignation_sub_type_ids?: number[]
  start?: string
  end?: string
  username?: string
  limit: number
  page: number
}): Promise<IResponse<{ pagination: PaginationType; result: ResignationItemType[] }>> => {
  return request.get({ url: '/manager/hr-manager/employee/get-resignation-list', params })
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
  return request.get({ url: '/manager/hr-manager/employee/get-users-list', params })
}

/**
 * 创建离职信息
 * @param data
 * @returns
 */
export const createResignationApi = (data: any): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/hr-manager/employee/create-resignation', data })
}

/**
 * 删除离职信息
 * @param params
 * @returns
 */
export const deleteResignationApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/hr-manager/employee/delete-resignation', data })
}

/**
 * 获取离职信息
 * @param params
 * @returns
 */
export const getResignationInfoApi = (params: {
  id: number
}): Promise<IResponse<ResignationItemType>> => {
  return request.get({ url: '/manager/hr-manager/employee/get-resignation', params })
}

/**
 * 更新离职信息
 * @param params
 * @returns
 */
export const updateResignationInfoApi = (data: any): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/hr-manager/employee/update-resignation', data })
}

/**
 * 获取离职人员相关的邮件组
 * @param params
 * @returns
 */
export const getRelatedEmailGroupApi = (params: {
  id: number
}): Promise<IResponse<{ users: UserInfoType[] }>> => {
  return request.get({ url: '/manager/hr-manager/employee/email-group', params })
}
