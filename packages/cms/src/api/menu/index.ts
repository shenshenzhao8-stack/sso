import request from '@/axios'

/**
 * type 1：管理端菜单；2：客户端菜单
 * @param data
 * @returns
 */
export const getMenuListApi = () => {
  return request.get({ url: '/manager/menu/user-menus' })
}
