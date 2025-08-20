import { cloneDeep } from 'lodash-es'

export default function fixRouter(routers: any) {
  const _routers = cloneDeep(routers)
  const list: any[] = []
  const callback = (itemList: any[], parent?: any) => {
    for (let i = 0; i < itemList.length; i++) {
      const item = cloneDeep({ ...itemList[i] })

      const result = itemList.find((e) => e.path === item.pageUrl)
      if (!result) {
        itemList[i] = {
          meta: {
            ...item,
            title: item.title
          },
          path: item.path,
          children: item.children || []
        }
      } else {
        result.meta = {
          ...result.meta,
          ...item
        }
        itemList[i] = result
      }

      if (item.children && item.children.length) {
        itemList[i].meta.alwaysShow = true
        callback(item.children || [], item)
      }
      list.push(itemList[i])
    }
  }

  callback(_routers)

  return _routers
}
