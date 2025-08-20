import request from '@/axios'

/**
 * 获取考试列表
 */
export const getExamListExam = (
  params: { page: number; limit: number } = { page: 1, limit: 30 }
) => {
  return request.get({ url: '/manager/exam/exam-list', params: params })
}

/**
 * 创建考试
 */
export const createExam = (data: any) => {
  return request.post({ url: '/manager/exam/create-exam', data: data })
}

/**
 * 更新考试
 */
export const updateExam = (data: any) => {
  return request.put({ url: '/manager/exam/update-exam', data: data })
}

/**
 * 删除考试
 */
export const deleteExam = (id: string) => {
  return request.delete({ url: '/manager/exam/delete-exam', data: { id } })
}

/**
 * 获取试题详情
 */
export const getExamDetail = (id: string) => {
  return request.get({ url: '/manager/exam/detail-exam', params: { id } })
}

/**
 * 获取考试结果列表
 */
export const getExamResultList = (data: {
  page: number
  limit: number
  id: string
  passed: number
}) => {
  return request.get({ url: '/manager/exam/exam-result-list', params: data })
}

/**
 * 下载考试结果文件
 * @param params
 * @returns
 */
export const downloadExamResultFile = (params: { id: number }): Promise<IResponse<any>> => {
  return request.get({ url: '/manager/exam/exam-result-file', params, responseType: 'blob' })
}

/**
 * 获取考试详情
 */
export const getExamResult = (data: { id: string }) => {
  return request.get({ url: '/manager/exam/exam-result', params: data })
}

/**
 * 更新考试结果
 */
export const changeExamResult = (data: {
  id: string
  exam_questions: { id: string; judge: number }[]
}) => {
  return request.put({ url: '/manager/exam/change-exam-result', data: data })
}

/**
 * 获取考试批次列表
 */
export const getExamBatchList = (data: { page: number; limit: number; integer?: string }) => {
  return request.get({ url: '/manager/exam/exam-batch-list', params: data })
}

/**
 * 删除考试结果
 */
export const deleteExamResult = (data: { id: string }) => {
  return request.delete({ url: '/manager/exam/delete-exam-result', data: data })
}

/**
 * 获取考试结果数量
 */
export const getExamResultCount = (data: { exam_id: number }) => {
  return request.get({ url: '/manager/exam/exam-result-count', params: data })
}
