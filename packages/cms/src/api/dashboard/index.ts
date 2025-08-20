import request from '@/axios'
import { type DashboardStatisticsType } from './types'

export const getDashboardStatisticsApi = (params: {
  business_tags?: number[]
  content_tags?: number[]
  end_at?: string
  start_at?: string
}): Promise<IResponse<DashboardStatisticsType>> => {
  return request.get({ url: '/manager/statistics/dashboard', params })
}
