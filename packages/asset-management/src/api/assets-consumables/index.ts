import request from '@/axios'
import type { IDataAssetsConsumablesAdd, IDataAssetsConsumablesEdit } from './type'
export const dataAssetsConsumablesPage = (
  params: { page: number; limit: number; type?: number[] } = { page: 1, limit: 20 }
) => {
  return request.get({ url: '/manager/asset/consumable/list', params })
}

export const dataAssetsConsumablesAdd = (data: IDataAssetsConsumablesAdd) => {
  return request.post({ url: '/manager/asset/consumable/create', data })
}

export const dataAssetsConsumablesEdit = (data: IDataAssetsConsumablesEdit) => {
  return request.put({ url: '/manager/asset/consumable/update', data })
}

export const dataAssetsConsumablesDetail = (id: number) => {
  return request.get({ url: `/manager/asset/consumable/detail`, params: { id } })
}

export const dataAssetsConsumablesDelete = (id: number) => {
  return request.delete({ url: `/manager/asset/consumable/delete`, data: { id } })
}

export const dataAssetsConsumablesOut = ({
  id,
  stock_num,
  receiver
}: {
  id: number
  stock_num: number
  receiver: number
}) => {
  return request.post({
    url: `/manager/asset/consumable/inventory-record-out`,
    data: {
      goods_id: id,
      stock_num: stock_num,
      receiver: receiver
    }
  })
}

export const dataAssetsConsumablesEnter = ({
  id,
  stock_num
}: {
  id: number
  stock_num: number
}) => {
  return request.post({
    url: `/manager/asset/consumable/inventory-record-in`,
    data: {
      goods_id: id,
      stock_num: stock_num
    }
  })
}

export const dataAssetsConsumablesRecordsDelete = (id: number) => {
  return request.delete({ url: '/manager/asset/consumable/inventory-record-delete', data: { id } })
}
