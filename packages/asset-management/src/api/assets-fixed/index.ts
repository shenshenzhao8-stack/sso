import request from '@/axios'

export const dataAssetsFixedPage = (params: { page: number; limit: number }) => {
  return request.get({ url: '/manager/asset/static/list', params })
}

export const dataAssetsFixedAdd = (data: any) => {
  return request.post({ url: '/manager/asset/static/insert', data })
}

export const dataAssetsFixedDetail = (id: string) => {
  return request.get({ url: 'manager/asset/static/detail', params: { id } })
}

export const dataAssetsFixedDel = (id: number) => {
  return request.delete({ url: '/manager/asset/static/del', data: { id } })
}

export const dataAssetsFixedEdit = (data: any) => {
  return request.put({ url: '/manager/asset/static/update', data })
}

export const dataAssetsFixedDeprecated = (id: string) => {
  return request.put({ url: '/manager/asset/static/scrap', data: { id } })
}

export const dataAssetsFixedRevert = (id: string) => {
  return request.put({ url: '/manager/asset/static/usage-records-back', data: { id } })
}

export const dataAssetsFixedUserList = () => {
  return request.get({ url: '/manager/asset/static/get-users-list' })
}

export const dataAssetsFixedUse = ({ id, user_id }: { id: number; user_id: number }) => {
  return request.post({
    url: '/manager/asset/static/usage-records-use',
    data: { id, uid: user_id }
  })
}

export const dataAssetsFixedRecordsDel = (id: number) => {
  return request.delete({ url: '/manager/asset/static/usage-records-del', data: { id } })
}
