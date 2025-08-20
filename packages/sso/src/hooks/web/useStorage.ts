// 获取传入的值的类型
const getValueType = (value: any) => {
  const type = Object.prototype.toString.call(value)
  return type.slice(8, -1)
}

const public_key = import.meta.env.VITE_STORE_PREFIX
export const useStorage = (type: 'sessionStorage' | 'localStorage' = 'sessionStorage') => {
  const setStorage = (_key: string, value: any) => {
    const key = public_key + _key
    const valueType = getValueType(value)
    window[type].setItem(key, JSON.stringify({ type: valueType, value }))
  }

  const getStorage = (_key: string) => {
    const key = public_key + _key
    const value = window[type].getItem(key)
    if (value) {
      const { value: val } = JSON.parse(value)
      return val
    } else {
      return value
    }
  }

  const removeStorage = (_key: string) => {
    const key = public_key + _key
    window[type].removeItem(key)
  }

  const clear = (excludes?: string[]) => {
    // 获取排除项
    const keys = Object.keys(window[type])
    const defaultExcludes: any = []
    const excludesArr = excludes ? [...excludes, ...defaultExcludes] : defaultExcludes
    const excludesKeys = excludesArr ? keys.filter((key) => !excludesArr.includes(key)) : keys
    // 排除项不清除
    excludesKeys.forEach((key) => {
      window[type].removeItem(key)
    })
    // window[type].clear()
  }

  return {
    setStorage,
    getStorage,
    removeStorage,
    clear
  }
}
