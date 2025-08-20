import type { AxiosResponse, InternalAxiosRequestConfig } from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import { SUCCESS_CODE, TRANSFORM_REQUEST_DATA } from '@/constants'
import { useUserStoreWithOut } from '@/stores/user'
import { objToFormData } from '@/utils'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
  if (
    config.method === 'post' &&
    config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(config.data)
  } else if (
    TRANSFORM_REQUEST_DATA &&
    config.method === 'post' &&
    config.headers['Content-Type'] === 'multipart/form-data' &&
    !(config.data instanceof FormData)
  ) {
    config.data = objToFormData(config.data)
  }
  if (config.method === 'get' && config.params) {
    const queryString = qs.stringify(config.params, { arrayFormat: 'repeat' })
    config.url = `${config.url}${queryString ? `?${queryString}` : ''}`
    config.params = {}
  }
  return config
}

const defaultResponseInterceptors = (response: AxiosResponse) => {
  if (response?.config?.responseType === 'blob') {
    // 如果是文件流，直接过
    return response
  } else if (response?.data?.code === 401) {
    ElMessage.error('登录态失效，请重新登录')
    const userStore = useUserStoreWithOut()
    userStore.logout()
  } else if (response?.data?.code === 403) {
    ElMessage.error('暂无权限，请联系管理员')
    return response.data
  } else if (response?.data?.code === 4030) {
    // TODO 暂定 code，后面全员干掉
    ElMessage.error(response?.data?.msg || '暂无权限，请联系管理员')
    return response.data
  } else {
    return response.data
  }
}

export { defaultResponseInterceptors, defaultRequestInterceptors }
