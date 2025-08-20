import request from '@/axios'
import type { AddTagDto, UpdateTagDto } from './type'

/**
 * 获取业务标签列表
 * @param params
 * @returns
 */
export const getBusinessTagList = (
  params: { page: number; limit: number } = { page: 1, limit: 30 }
) => {
  return request.get({ url: '/manager/dict/business-tag-list', params: params })
}

/**
 * 创建业务标签
 * @param params
 * @returns
 */
export const createBusinessTag = (data: AddTagDto) => {
  return request.post({ url: '/manager/dict/create-business-tag', data })
}

/**
 * 修改业务标签
 * @param params
 * @returns
 */
export const updateBusinessTag = (data: UpdateTagDto) => {
  return request.put({ url: '/manager/dict/update-business-tag', data })
}

/**
 * 删除业务标签
 * @param params
 * @returns
 */
export const deleteBusinessTag = (id: string) => {
  return request.delete({
    url: '/manager/dict/delete-business-tag',
    data: {
      id
    }
  })
}

/**
 * 获取内容标签列表
 * @param params
 * @returns
 */
export const getContentTagList = (
  params: { page: number; limit: number } = { page: 1, limit: 30 }
) => {
  return request.get({ url: '/manager/dict/content-tag-list', params: params })
}

/**
 * 创建内容标签
 * @param params
 * @returns
 */
export const createContentTag = (data: AddTagDto) => {
  return request.post({ url: '/manager/dict/create-content-tag', data })
}

/**
 * 修改内容标签
 * @param params
 * @returns
 */
export const updateContentTag = (data: UpdateTagDto) => {
  return request.put({ url: '/manager/dict/update-content-tag', data })
}

/**
 * 删除内容标签
 * @param params
 * @returns
 */
export const deleteContentTag = (id: string) => {
  return request.delete({
    url: '/manager/dict/delete-content-tag',
    data: {
      id
    }
  })
}

/**
 * 获取用户拥有的标签列表
 * @param params
 * @returns
 */
export const getDictEags = (data?: { category?: string }) => {
  return request.get({
    url: '/manager/tags',
    params: data
  })
}
