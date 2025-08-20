import request from '@/axios'
import type { BannerItemType } from './types'
import type { PaginationInfoType } from '@/api/common/type'

export const getBannerListApi = (params: {
  page: number
  limit: number
}): Promise<IResponse<{ items: BannerItemType[]; pagination: PaginationInfoType }>> => {
  return request.get({ url: '/manager/banner/list-banner', params })
}

export const createBannerApi = (data: any): Promise<IResponse<{ id: number }>> => {
  return request.post({ url: '/manager/banner/create-banner', data })
}

export const deleteBannerApi = (params: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/banner/delete-banner', params })
}

export const getBannerDetailApi = (params: { id: number }): Promise<IResponse<BannerItemType>> => {
  return request.get({ url: '/manager/banner/get-banner', params })
}

export const updateBannerApi = (data: any): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/banner/update-banner', data })
}
