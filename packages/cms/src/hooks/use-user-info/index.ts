import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { isArray } from 'lodash-es'
import { getToken, getUserInfoApi } from '@/api/login'
import { getMenuListApi } from '@/api/menu'
import { useUserStoreWithOut } from '@/stores/user'
import { useMenuStoreWithOut } from '@/stores/menuView'
import { useAppStoreWithOut } from '@/stores/app'

const getRole = async () => {
  const userStore = useUserStoreWithOut()

  const res = await getMenuListApi()
  if (res.code == 200) {
    const routers = res.data

    if (!isArray(routers) || routers.length === 0) {
      ElMessage.error('您没有登录权限，如需登录请联系管理员或部门负责人开通')
      userStore.reset()
      return
    }

    return routers
  } else {
    let errMsg = '登录失败'
    if (res.code === 403) {
      errMsg = '暂无权限，请联系管理员'
    }
    ElMessage.error(errMsg)
    userStore.reset()
  }
}

const removeAccessTokenParam = () => {
  // TODO url 清理问题
  setTimeout(() => {
    if (typeof window === 'undefined') return // 确保代码在客户端执行

    const url = new URL(window.location.href)
    const searchParams = new URLSearchParams(url.search)

    // 删除指定参数
    searchParams.delete('ticket')

    // 构造新的 URL：保留 pathname 和可能存在的 hash（如锚点）
    const newUrl =
      url.origin + url.pathname + (searchParams.toString() ? `?${searchParams}` : '') + url.hash
    // 替换地址栏，但不跳转页面
    window.history.replaceState({}, '', newUrl)
  }, 1000)
}

export async function useUserInfo(params: string) {
  const menuStore = useMenuStoreWithOut()
  const userStore = useUserStoreWithOut()
  const appStore = useAppStoreWithOut()

  const loading = ref(true)
  const error = ref()
  const userInfo = ref({})
  const menuInfo = ref<any>([])

  const isQuery = params

  const isToken = userStore.getRefreshToken && userStore.getToken

  if (!isQuery && !isToken) {
    window.location.replace(
      `${import.meta.env.VITE_CERTIFICATION_CENTER_PATH}?redirectURL=${window.location.href}`
    )
    return
  }
  try {
    if (!isToken) {
      // 先获取双 token
      const res = await getToken(params)
      if (res.code !== 200) {
        ElMessage.error('登录失败，请重新登录')
        return
      }

      userStore.setToken(`Bearer ${res.data?.access_token}`)
      userStore.setRefreshToken(res.data?.refresh_token)
    }

    removeAccessTokenParam()

    const infoRes = await getUserInfoApi({})
    userStore.setUserInfo(infoRes.data)

    userInfo.value = infoRes.data
    appStore.setShowResetPassword(infoRes.data?.initial_password === 1)

    if (!menuStore.getMenuList) {
      const routers = await getRole()

      if (!routers) return

      const menuList = menuStore.initMenuRouter(routers)
      menuStore.setMenuList(menuList)
      const path = routers.find((item: any) => item.path)?.path
      if (!path) return
      console.log('登录成功后的跳转', path)
    }

    menuInfo.value = menuStore.getMenuList
  } catch (err) {
    error.value =
      'Failed to fetch information: ' + (err instanceof Error ? err.message : String(err))
  } finally {
    loading.value = false
  }

  return {
    loading,
    error
  }
}
