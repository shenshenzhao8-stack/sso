import request from '@/axios'
import type { IParamsDataPermissionsCreate, IParamsDataPermissionsEdit } from './type'

export function dataPermissionsPage(params: { page: number; limit: number }) {
  return request.get({ url: '/manager/asset/permission/role-list', params })
}

export function dataPermissionsList() {
  return request.get({ url: '/manager/asset/permission/all-selection' })
}

export function dataPermissionsCreate(data: IParamsDataPermissionsCreate) {
  return request.post({ url: '/manager/asset/permission/create-role', data })
}

export function dataPermissionsDetail(id: number) {
  return request.get({ url: '/manager/asset/permission/role-detail', params: { id } })
}

export function dataPermissionsEdit(data: IParamsDataPermissionsEdit) {
  return request.put({ url: '/manager/asset/permission/update-role', data })
}

export function dataPermissionsDelete(id: number) {
  return request.delete({ url: '/manager/asset/permission/delete-role', data: { id } })
}
