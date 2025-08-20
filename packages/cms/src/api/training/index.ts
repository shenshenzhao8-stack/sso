import request from '@/axios'

/**
 * 创建培训
 * @param data
 * @returns
 */
export const createTraining = (data: any) => {
  return request.post({ url: '/manager/information-training/create-training', data })
}

/**
 * 获取培训详情
 * @param data
 * @returns
 */
export const getDetailTraining = (data: { id: string | number }) => {
  return request.get({ url: '/manager/information-training/detail-training', params: data })
}

/**
 * 更新培训
 * @param data
 * @returns
 */
export const updateTraining = (data: any) => {
  return request.put({ url: '/manager/information-training/update-training', data: data })
}

/**
 * 获取培训列表
 */
export const getListTraining = (data: {
  page: number
  limit: number
  batch?: number
  title?: string
}) => {
  return request.get({ url: '/manager/information-training/list-training', params: data })
}

/**
 * 删除培训
 */
export const deleteTraining = (data: { id: string }) => {
  return request.delete({ url: '/manager/information-training/delete-training', data: data })
}

/**
 * 获取培训课程详情
 */
export const getTrainingCourse = (data: { id: number }) => {
  return request.get({ url: '/manager/information-training/training-course', params: data })
}

/**
 * 获取培训批次列表
 */
export const getTrainingBatchList = (data: { page: number; limit: number; integer?: string }) => {
  return request.get({ url: '/manager/information-training/training-batch-list', params: data })
}
