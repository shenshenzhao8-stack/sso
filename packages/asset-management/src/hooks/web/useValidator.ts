import type { FormItemRule } from 'element-plus'

interface LengthRange {
  min: number
  max: number
  message?: string
}

export const useValidator = () => {
  const required = (message?: string): FormItemRule => {
    return {
      required: true,
      message: message || '该项为必填项'
    }
  }

  const lengthRange = (options: LengthRange): FormItemRule => {
    const { min, max, message } = options

    return {
      min,
      max,
      message: message || `长度在 ${min} 到 ${max} 个字符`
    }
  }

  const notSpace = (message?: string): FormItemRule => {
    return {
      validator: (_, val, callback) => {
        if (val?.indexOf(' ') !== -1) {
          callback(new Error(message || '不能包含空格'))
        } else {
          callback()
        }
      }
    }
  }

  const notSpecialCharacters = (message?: string): FormItemRule => {
    return {
      validator: (_, val, callback) => {
        if (/[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/gi.test(val)) {
          callback(new Error(message || '不能包含特殊字符'))
        } else {
          callback()
        }
      }
    }
  }

  const _decimalPlaces = (message?: string): FormItemRule => {
    return {
      validator: (_, val, callback) => {
        if (val && !/^\d+(\.\d{1,2})?$/.test(val)) {
          callback(new Error(message || '最多保留两位小数'))
        } else {
          callback()
        }
      }
    }
  }

  const _integer = (message?: string): FormItemRule => {
    return {
      validator: (_, val, callback) => {
        if (val && !/^\d+$/.test(val)) {
          callback(new Error(message || '只能输入整数'))
        } else {
          callback()
        }
      }
    }
  }

  return {
    required,
    lengthRange,
    notSpace,
    notSpecialCharacters,
    _decimalPlaces,
    _integer
  }
}
