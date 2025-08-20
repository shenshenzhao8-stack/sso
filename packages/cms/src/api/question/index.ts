import request from '@/axios'
import type { QuestionItemType } from './type'
import type { PaginationInfoType } from '@/api/common/type'

export const getQuestionListApi = (params: {
  page: number
  limit: number
}): Promise<
  IResponse<{
    list: QuestionItemType[]
    pagination: PaginationInfoType
  }>
> => {
  return request.get({ url: '/manager/question-bank/list-question', params: params })
}

export const deleteQuestionApi = (params: { id: number }): Promise<IResponse<any>> => {
  return request.delete({ url: '/manager/question-bank/delete-question', params: params })
}

export const createQuestionApi = (data: any): Promise<IResponse<any>> => {
  return request.post({ url: '/manager/question-bank/create-question', data })
}

export const getQuestionApi = (params: { id: number }): Promise<IResponse<QuestionItemType>> => {
  return request.get({ url: '/manager/question-bank/get-question', params })
}

export const updateQuestionApi = (data: any): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/question-bank/update-question', data })
}

export const getListQuestionIds = (params: { ids: number[] }) => {
  return request.get({ url: '/manager/question-bank/list-question-ids', params })
}

export const getQuestionFileTemplateApi = (): Promise<IResponse<any>> => {
  return request.get({
    url: '/manager/question-bank/multiple-question-template',
    responseType: 'blob'
  })
}

export const batchImportQuestionsApi = (data: any): Promise<IResponse<any>> => {
  return request.put({ url: '/manager/question-bank/insert-multiple-question', data })
}
