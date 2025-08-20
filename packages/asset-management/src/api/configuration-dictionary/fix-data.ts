import { isBoolean, isNumber, find } from 'lodash-es'

export const fixDataConfigurationDictionaryList = (res: any, isDelId?: number | boolean) => {
  let arr = []

  if (isBoolean(isDelId)) {
    arr = res?.data?.map((item: { type: any; id: any }) => ({
      label: item.type,
      value: item.id
    }))
  }

  if (isNumber(isDelId)) {
    arr = res?.data?.map((item: { type: any; id: any }) => ({
      label: item.type,
      value: item.id,
      disabled: !!find(res?.data, { id: isDelId })
    }))
  }

  return {
    code: res?.code,
    data: arr
  }
}
