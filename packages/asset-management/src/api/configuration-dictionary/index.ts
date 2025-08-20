import request from '@/axios'

import type {
  IPropsDataConfigurationDictionaryAdd,
  IPropsDataConfigurationDictionaryEdit
} from './type'

export const dataConfigurationDictionaryList = (params: {
  with_del?: boolean
  /**
   * 1 固定资产
   * 2 消耗品
   */
  category?: number
}) => {
  return request.get({ url: '/manager/asset/dict/goods-type-select', params })
}

export const dataConfigurationDictionaryPage = (params: {
  page: number
  limit: number
  with_del?: boolean
}) => {
  return request.get({ url: '/manager/asset/dict/goods-type-list', params })
}

export const dataConfigurationDictionaryAdd = (data: IPropsDataConfigurationDictionaryAdd) => {
  return request.post({ url: '/manager/asset/dict/create-goods-type', data })
}

export const dataConfigurationDictionaryEdit = (data: IPropsDataConfigurationDictionaryEdit) => {
  return request.put({ url: '/manager/asset/dict/goods-type-update', data })
}

export const dataConfigurationDictionaryDel = (id: number) => {
  return request.delete({
    url: '/manager/asset/dict/goods-type-delete',
    data: {
      id
    }
  })
}
