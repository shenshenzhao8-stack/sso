import request from '@/axios'

/**
 * 创建资料库
 * @param data
 * @returns
 */
export const createKnowledgeBase = (data: any) => {
  return request.post({ url: '/manager/material/create', data })
}

/**
 * 获取资资料库详情
 * @param data
 * @returns
 */
export const getKnowledgeBase = (data: { id: string | number }) => {
  return request.get({ url: '/manager/material/detail', params: data })
}

/**
 * 更新资料库
 * @param data
 * @returns
 */
export const updateKnowledgeBase = (data: any) => {
  return request.put({ url: '/manager/material/update', data: data })
}

/**
 * 获取资料库列表
 */
export const getListKnowledgeBase = (data: {
  page: number
  limit: number
  business_tag?: number[]
  content_tag?: number[]
  key_word?: string
}) => {
  return request.get({ url: '/manager/material/list', params: data })
}

/**
 * 删除资料库
 */
export const deleteKnowledgeBase = (data: { id: string }) => {
  return request.delete({ url: '/manager/material/delete', params: data })
}
