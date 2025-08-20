import request from '@/axios'
import type { DictItemType } from './types'
import type { PaginationInfoType } from '@/api/common/types'

/**
 * 获取字典列表
 * @param params type: 1 合同归属, 2 项目名称
 * @returns
 */
export const getDictListApi = (params: {
  page: number
  limit: number
  name?: string
  type?: number
}): Promise<IResponse<{ result: DictItemType[]; pagination: PaginationInfoType }>> => {
  return request.get({ url: '/manager/user-center/get-dict-list', params })
}

/**
 * 创建字典
 * @param data
 * @returns
 */
export const createDictApi = (data: {
  name: string
  type: number
}): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/manager/user-center/create-dict', data })
}

/**
 * 删除字典
 * @param params
 * @returns
 */
export const deleteDictApi = (data: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/user-center/delete-dict', data })
}

/**
 * 获取字典详情
 * @param params
 * @returns
 */
export const getDictDetailApi = (params: { id: number }): Promise<IResponse<DictItemType>> => {
  return request.get({ url: '/manager/user-center/get-dict-detail', params })
}

/**
 * 更新字典
 * @param data
 * @returns
 */
export const updateDictApi = (data: {
  name: string
  id: number
}): Promise<IResponse<{ id: number }>> => {
  return request.put({ url: '/manager/user-center/update-dict', data })
}
