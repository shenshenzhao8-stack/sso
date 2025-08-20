import request from '@/axios'
import type { ContentItemType } from './types'
import type { PaginationInfoType } from '@/api/common/type'

export const getNewsListApi = (params: {
  page: number
  limit: number
  business_tag?: string
  content_tag?: string
  key_word?: string
}): Promise<IResponse<{ items: ContentItemType[]; pagination: PaginationInfoType }>> => {
  return request.get({ url: '/manager/information-content/list', params })
}

export const createNewsApi = (data: any): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/manager/information-content/create', data })
}

export const deleteNewsApi = (params: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/information-content/delete', params })
}

export const getNewsDetailApi = (params: { id: number }): Promise<IResponse<ContentItemType>> => {
  return request.get({ url: '/manager/information-content/detail', params })
}

export const updateNewsApi = (data: any): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/information-content/update', data })
}
