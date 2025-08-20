import { canRouterMap } from '@ff/config'
import _ from 'lodash'
import request from '@/axios'

export const dataTopMenu = async () => {
  const obj = await request
    .get({ url: '/manager/user-center/get-user-permission-list' })
    .then((res) => {
      const arr1 = canRouterMap(import.meta.env.MODE as any).items
      const arr2 = res.data.result

      // 获取数组 1 中所有的 key
      const keysInArray1 = _.map(arr1, 'key')

      // 过滤掉数组 2 中 server_code 不在数组 1 的 key 中的对象
      const filteredArray2 = _.filter(arr2, (item) => _.includes(keysInArray1, item.server_code))

      // 合并数组
      const mergedArray = _.filter(arr1, (item1) => {
        const matchingItem = _.find(filteredArray2, { server_code: item1.key })
        return matchingItem
      })

      return {
        code: res.code,
        data: mergedArray || []
      }
    })

  return obj
}
