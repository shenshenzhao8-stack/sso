import { useMenuStore } from '@/stores/menuView'
import dayjs from 'dayjs'
import { uploadFile } from '@/api/common/index'
import { isArray } from '@/utils/is'

/**
 *
 * @param component 需要注册的组件
 * @param alias 组件别名
 * @returns any
 */
export const withInstall = <T>(component: T, alias?: string) => {
  const comp = component as any
  comp.install = (app: any) => {
    app.component(comp.name || comp.displayName, component)
    if (alias) {
      app.config.globalProperties[alias] = component
    }
  }
  return component as T & Plugin
}

/**
 * @param str 需要转下划线的驼峰字符串
 * @returns 字符串下划线
 */
export const humpToUnderline = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * @param str 需要转驼峰的下划线字符串
 * @returns 字符串驼峰
 */
export const underlineToHump = (str: string): string => {
  if (!str) return ''
  return str.replace(/-(\w)/g, (_, letter: string) => {
    return letter.toUpperCase()
  })
}

/**
 * 驼峰转横杠
 */
export const humpToDash = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const setCssVar = (prop: string, val: any, dom = document.documentElement) => {
  dom.style.setProperty(prop, val)
}

export const getCssVar = (prop: string, dom = document.documentElement) => {
  return getComputedStyle(dom).getPropertyValue(prop)
}

/**
 * 查找数组对象的某个下标
 * @param {Array} ary 查找的数组
 * @param {Functon} fn 判断的方法
 */

export const findIndex = <T = Recordable>(ary: Array<T>, fn: Fn): number => {
  if (ary.findIndex) {
    return ary.findIndex(fn)
  }
  let index = -1
  ary.some((item: T, i: number, ary: Array<T>) => {
    const ret: T = fn(item, i, ary)
    if (ret) {
      index = i
      return ret
    }
  })
  return index
}

export const trim = (str: string) => {
  return str.replace(/(^\s*)|(\s*$)/g, '')
}

/**
 * @param {Date | number | string} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
export function formatTime(time: Date | number | string, fmt: string) {
  if (!time) return ''
  else {
    const date = new Date(time)
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      S: date.getMilliseconds()
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? (o as any)[k]
            : ('00' + (o as any)[k]).substr(('' + (o as any)[k]).length)
        )
      }
    }
    return fmt
  }
}

/**
 * 生成随机字符串
 */
export function toAnyString() {
  const str: string = 'xxxxx-xxxxx-4xxxx-yxxxx-xxxxx'.replace(/[xy]/g, (c: string) => {
    const r: number = (Math.random() * 16) | 0
    const v: number = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString()
  })
  return str
}

/**
 * 首字母大写
 */
export function firstUpperCase(str: string) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
}

/**
 * 把对象转为formData
 */
export function objToFormData(obj: Recordable) {
  const formData = new FormData()
  Object.keys(obj).forEach((key) => {
    formData.append(key, obj[key])
  })
  return formData
}

/**
 * 获取当前页面按钮权限
 * @param path 路由
 * @returns
 */
export const getPageBtnPermission = (path: string) => {
  const menuStore = useMenuStore()
  const paths = path.split('/')
  const result = menuStore.getAllMenuRouter.find(
    (item) => item.path === paths[paths.length - 1] || item.path === path
  )
  return (result?.meta?.actions as string[]) || []
}

/**
 * 获取视频第一帧
 * @param url 视频url
 * @returns
 */
export const getVideoFirstFrameUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = url
    video.preload = 'auto'
    video.crossOrigin = 'Anonymous'
    video.addEventListener('error', (error) => {
      reject(error)
      video.remove()
    })
    video.addEventListener('canplay', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const posterUrl = canvas.toDataURL()
      resolve(posterUrl)
      video.remove()
      canvas.remove()
    })
  })
}

/**
 * 获取题目类别
 * @param
 * @returns
 */
export const getQuestionType = (value: string) => {
  const list = [
    { label: '单选题', value: '1' },
    { label: '多选题', value: '2' },
    { label: '问答题', value: '3' },
    { label: '判断题', value: '4' }
  ]
  return list.find((item) => item.value == value)?.label || '未知'
}

/**
 * 获取html中的图片和视频
 * @param htmlContent
 * @returns
 */
export const getHtmlImageAndVideo = (htmlContent: string) => {
  const result = []

  // 正则表达式匹配图片 <img> 标签
  const imageRegex = /<img\s+[^>]*src\s*=\s*['"](https?:\/\/[^'"]+)['"][^>]*>/g
  let match

  // 提取所有图片 URL
  while ((match = imageRegex.exec(htmlContent)) !== null) {
    result.push({ type: 'image', url: match[1] })
  }

  // 正则表达式匹配视频 <video> 标签
  const videoRegex =
    /<video\s+[^>]*>[\s\S]*<source\s+[^>]*src\s*=\s*['"](https?:\/\/[^'"]+)['"][^>]*[\s\S]*<\/video>/g

  // 提取所有视频 URL
  while ((match = videoRegex.exec(htmlContent)) !== null) {
    result.push({ type: 'video', url: match[1] })
  }

  return result
}

/**
 * 获取当天时间 s 级别
 * @param data
 * @returns
 */
export const getDayTimeNumber = (data: Date) => {
  const hours = dayjs(data).hour() // 获取小时
  const minutes = dayjs(data).minute() // 获取分钟
  const seconds = dayjs(data).second() // 获取秒

  return hours * 3600 + minutes * 60 + seconds // 转换为毫秒
}

/**
 * 检查对象的所有属性是否都为 false
 * 此函数通过检查对象的每个属性值是否为真来确定对象的所有属性是否都为 false
 * 如果所有属性值都为假（例如 null, '', [], false, 0 等），则函数返回 true；否则返回 false
 *
 * @param {Object} obj - 待检查的对象
 * @param {string[]} filterList - 不检查哪些属性
 * @returns {boolean} - 如果所有属性都为 false，则返回 true；否则返回 false
 */
export const allPropertiesAreFalse = (
  obj: { [string: string]: any },
  filterList?: string[]
): boolean => {
  return Object.keys(obj).filter((key: string) => {
    const value = obj[key]

    if (filterList?.includes(key)) {
      return false
    }
    return typeof value === 'undefined' || value === null || value === '' || value.length == 0
      ? false
      : true
  }).length
    ? true
    : false
}

/**
 * 获取html中的第一张图片或视频的首帧url
 * @param htmlContent
 * @param contentId
 * @returns
 */
export const getHtmlFirstImageUrl = async (htmlContent: string, contentId: number) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const getSrc = (tagName: any) => {
    const tag = doc.querySelector(tagName)
    return tag ? tag.src || tag.getAttribute('src') : null
  }
  const imgSrc = getSrc('img')
  const videoSource = getSrc('video source')

  if (imgSrc) {
    return new Promise<string>((resolve, _reject) => {
      resolve(imgSrc)
    })
  }
  if (videoSource) {
    const res = await getVideoFirstFrameUrl(videoSource)
    const binaryString = atob(res.split(',')[1])
    const arrayBuffer = new ArrayBuffer(binaryString.length)
    const uint8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([uint8Array], { type: 'image/png' })
    const file = new File([blob], `${contentId}`, { type: 'image/png' })
    const uploadRes = await uploadFile(file)
    return uploadRes
  }
  return undefined
}

/**
 * 判断图片宽高比是否有效
 * @param file
 * @param rate
 * @returns
 */
export const judgeImageHWRate = (file: any, rate: number = 9 / 16): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    const objectURL = URL.createObjectURL(file)

    img.onload = function () {
      const width = img.naturalWidth
      const height = img.naturalHeight
      console.log(`图片宽度: ${width}px，图片高度: ${height}px`)
      URL.revokeObjectURL(objectURL)
      resolve(height / width === rate)
    }

    img.onerror = function () {
      URL.revokeObjectURL(objectURL)
      resolve(false)
    }

    img.src = objectURL
  })
}

/**
 * 获取文件名
 * @param url
 * @returns
 */
export const getFileName = (url: string) => {
  const arr = url.split('/')
  const fileName = arr[arr.length - 1] ?? ''
  const nameAry = fileName.split('-')
  const typeAry = fileName.split('.')
  const type = typeAry[typeAry.length - 1] ?? ''
  const name = nameAry[0] ?? ''
  return `${decodeURIComponent(name)}.${type}`
}

/**
 * 将秒数转换为时分秒格式
 * @param seconds
 * @returns
 */
export const secondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  // 补零
  const paddedHours = String(hours).padStart(2, '0')
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${paddedHours}时${paddedMinutes}分${paddedSeconds}秒`
}

/**
 * 判断html中是否有内容
 * @param htmlString
 * @returns
 */
export const htmlHasContent = (htmlString: string = '') => {
  // 创建一个临时的 DOM 元素
  const tempDiv = document.createElement('div')
  // 设置该元素的 innerHTML 为传入的 HTML 字符串
  tempDiv.innerHTML = htmlString

  // 获取该元素中的文本内容
  const content = tempDiv.innerText || tempDiv.textContent

  // 判断是否包含有效内容
  return content?.trim() !== ''
}

export const detailPageHasHandlePermission = (id: number) => {
  const menuStore = useMenuStore()
  const menuList = menuStore.getMenuList
  const currentMenu = menuList.find((item) => item.meta?.id === id)
  if (!currentMenu) return false
  if (
    isArray(currentMenu.meta?.actions) &&
    currentMenu.meta.actions.find((item) => item === 'POST' || item === 'PUT' || item === 'DELETE')
  ) {
    return true
  }
  return false
}

/**
 * 获取时分秒时间戳
 * @param data
 * @returns
 */
export const getTimeNumber = (data: Date) => {
  return (data.getHours() * 3600 + data.getMinutes() * 60 + data.getSeconds()) * 1000
}
