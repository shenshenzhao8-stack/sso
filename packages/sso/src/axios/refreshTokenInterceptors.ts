import type { AxiosResponse } from './types'
import { ElMessage } from 'element-plus'
import { useUserStoreWithOut } from '@/stores/user'
import { refreshToken } from '@/api/login'
import axios from 'axios'

let isRefreshing = false // 标记是否正在刷新token
let requests: ((token: string) => void)[] = [] // 存储待重试的请求

const getRefreshToken = async () => {
  const userStore = useUserStoreWithOut()
  let newToken = ''
  try {
    isRefreshing = true
    const response = await refreshToken({
      refresh_token: userStore.getRefreshToken
    })
    if (response.code != 200) {
      ElMessage.error('登录信息已过期，请重新登录')
      userStore.logout()
      requests = [] // 清空待重试的请求队列
      return
    }
    newToken = response.data.token
    userStore.setToken(newToken)
    userStore.setRefreshToken(response.data?.refresh_token)
  } catch (error) {
    userStore.reset()
    requests = [] // 清空待重试的请求队列
  } finally {
    isRefreshing = false
  }
  return newToken
}

// 提取设置 _retry 标志的函数
const setRetryFlag = (config: any) => {
  config._retry = true
  return config
}

export const refreshTokenInterceptors = async (
  response: AxiosResponse
): Promise<AxiosResponse<any, any>> => {
  if (
    response?.data?.code === 401 &&
    response!.config!.url &&
    response!.config!.url.indexOf('/refresh-token') === -1
  ) {
    const { config, data } = response
    const originalConfig: any = config
    if (data.code === 401 && !originalConfig._retry) {
      if (!isRefreshing) {
        const newToken = await getRefreshToken()
        if (newToken) {
          requests.forEach((callback) => callback(newToken))
          requests = []
        } else {
          return response
        }
        originalConfig.headers['Authorization'] = `Bearer ${newToken}`
        const result = await axios(setRetryFlag(originalConfig))
        return result
      } else {
        return new Promise((resolve) => {
          requests.push((token) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`
            axios(setRetryFlag(originalConfig)).then((result) => {
              resolve(result)
            })
          })
        })
      }
    } else {
      return response
    }
  }
  return response
}
