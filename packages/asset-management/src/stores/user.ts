import { defineStore } from 'pinia'
import { store } from './index'
import type { UserLoginType, UserType } from '@/api/login/types'
import { ElMessageBox } from 'element-plus'
import { loginOutApi } from '@/api/login'
import { useTagsViewStore } from './tagsView'
import router from '@/router'
import { logoutIframeCommunicator } from '@/utils/communicator'

interface UserState {
  userInfo?: UserType
  tokenKey: string
  token: string
  refreshToken: string
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: UserLoginType
}

export const useUserStore = defineStore(`${import.meta.env.VITE_BASE_PATH}_user`, {
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'Authorization',
      token: '',
      refreshToken: '',
      roleRouters: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: undefined
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.token ? `Bearer ${this.token}` : this.token
    },
    getRefreshToken(): string {
      return this.refreshToken
    },
    getUserInfo(): UserType | undefined {
      return this.userInfo
    },
    getRoleRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.roleRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setToken(token: string) {
      this.token = token
    },
    setRefreshToken(token: string) {
      this.refreshToken = token
    },
    setUserInfo(userInfo?: UserType) {
      this.userInfo = userInfo
    },
    setRoleRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.roleRouters = roleRouters
    },
    logoutConfirm() {
      ElMessageBox.confirm('是否退出本系统？', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // const res = await loginOutApi().catch(() => {})
          // if (res) {
          //   this.reset()
          // }

          this.logout()
        })
        .catch(() => {})
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      // this.setToken('')
      this.setRefreshToken('')
      this.setToken('')
      this.setUserInfo(undefined)
      // this.setRoleRouters([])
      // localStorage.clear()
      // sessionStorage.clear()

      logoutIframeCommunicator()
    },
    logout() {
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    }
  },
  persist: {
    pick: ['token', 'refreshToken']
  }
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
