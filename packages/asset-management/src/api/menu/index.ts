import request from '@/axios'

export const getMenuListApi = () => {
  return request.get({ url: '/manager/asset/menu/user-menus' })
}
