import router from '@/router'
import { getPageBtnPermission } from '@/utils'

export const hasPermi = (value: string) => {
  // const permission = (router.currentRoute.value.meta.permission || []) as string[]
  const permission = getPageBtnPermission(router.currentRoute.value.path)

  if (!value) {
    throw new Error('请设置操作权限值')
  }
  if (permission.includes(value)) {
    return true
  }
  return false
}
