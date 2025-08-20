import { ref, unref } from 'vue'
import { findPath } from '@/utils/tree'

type OnlyOneChildType = AppRouteRecordRaw & { noShowingChildren?: boolean }

interface HasOneShowingChild {
  oneShowingChild?: boolean
  onlyOneChild?: OnlyOneChildType
}

export const getAllParentPath = <T = Recordable>(treeData: T[], path: string) => {
  const menuList = findPath(treeData, (n) => n.path === path) as AppRouteRecordRaw[]
  return (menuList || []).map((item) => item.path)
}

export const hasOneShowingChild = (
  children: AppRouteRecordRaw[] = [],
  parent: AppRouteRecordRaw
): HasOneShowingChild => {
  const onlyOneChild = ref<OnlyOneChildType>()

  const showingChildren = children.filter((v) => {
    const meta = v.meta ?? {}
    if (meta.hidden) {
      return false
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = v
      return true
    }
  })

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return {
      oneShowingChild: true,
      onlyOneChild: unref(onlyOneChild)
    }
  }

  // Show parent if there are no child router to display
  if (!showingChildren.length) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return {
      oneShowingChild: true,
      onlyOneChild: unref(onlyOneChild)
    }
  }

  return {
    oneShowingChild: false,
    onlyOneChild: unref(onlyOneChild)
  }
}

export const getAllRouters = (routers: AppRouteRecordRaw[]) => {
  const allRouters: AppRouteRecordRaw[] = []
  const callback = (itemList: AppRouteRecordRaw[], parent?: AppRouteRecordRaw) => {
    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i]
      if (parent) item.path = parent.path + '/' + item.path
      allRouters.push(item)
      if (item.children && item.children.length) {
        callback(item.children, item)
      }
    }
  }
  callback(routers)
  return allRouters
}
