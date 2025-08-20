import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { cloneDeep } from 'lodash-es'
import { defineStore } from 'pinia'
import { store } from './index'

export interface MenuViewState {
  allMenuRouter: RouteLocationNormalizedLoaded[]
  menuList: AppRouteRecordRaw[]
}

export const useMenuStore = defineStore(`${import.meta.env.VITE_STORE_PREFIX}_menuView`, {
  state: (): MenuViewState => ({
    allMenuRouter: [],
    menuList: []
  }),
  getters: {
    getAllMenuRouter(): RouteLocationNormalizedLoaded[] {
      return this.allMenuRouter
    },
    getMenuList(): AppRouteRecordRaw[] {
      return this.menuList
    }
  },
  actions: {
    setAllMenuRouter(views: RouteLocationNormalizedLoaded[]): void {
      this.allMenuRouter = views
    },
    setMenuList(views: AppRouteRecordRaw[]): void {
      this.menuList = views
    },
    initMenuRouter(_routers: any[]) {
      const routers = cloneDeep(_routers)
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
      callback(routers)
      this.allMenuRouter = list
      return routers
    }
  },
  persist: {
    pick: ['allMenuRouter', 'menuList']
  }
})

export const useMenuStoreWithOut = () => {
  return useMenuStore(store)
}
