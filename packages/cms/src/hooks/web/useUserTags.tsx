import { onMounted, ref } from 'vue'
import { getDictEags } from '@/api/tag'
import { ElTag } from 'element-plus'

export const useUserTags = (config: {
  disabled: boolean
  mounted: () => void
  tagsParms?: {
    category?: string
  }
}) => {
  const disabled = ref<boolean>(config.disabled)
  // http 用户请求下来的
  const business_tags = ref<any[]>([])
  const content_tags = ref<any[]>([])

  // 所有下拉选项
  const all_content_tags_list = ref<any[]>([])
  const all_business_tags_list = ref<any[]>([])

  // 记录用户选中的标签
  const all_select_content_tag_ids = ref<any[]>([])
  const all_select_business_tag_ids = ref<any[]>([])

  const setDisabled = (isDisable: boolean) => {
    disabled.value = isDisable
  }

  const mergeBusinessTags = (tags: any[] = []) => {
    const business = tags
      .filter((item: any) => {
        return !business_tags.value.find((business_tag: any) => business_tag.id === item.id)
      })
      .map((item: any) => {
        return { ...item, disabled: true }
      })

    all_business_tags_list.value = [...business_tags.value, ...business].map((item: any) => {
      return {
        label: item.name,
        value: item.id,
        disabled: item.disabled
      }
    })

    all_select_business_tag_ids.value = tags.map((item: any) => {
      return item.id
    })
  }

  const mergeContentTags = (tags: any[] = []) => {
    const content = (tags || [])
      .filter((item: any) => {
        return !content_tags.value.find((content_tag: any) => content_tag.id === item.id)
      })
      .map((item: any) => {
        return { ...item, disabled: true }
      })
    all_content_tags_list.value = [...content_tags.value, ...content].map((item: any) => {
      return {
        label: item.name,
        value: item.id,
        disabled: item.disabled
      }
    })

    all_select_content_tag_ids.value = tags.map((item: any) => {
      return item.id
    })
  }

  const getUserHttpTags = async () => {
    const result = await getDictEags(config.tagsParms)

    const { business_tags: business = [], content_tags: content = [] } = result.data || {}
    business_tags.value = business
    content_tags.value = content
  }

  onMounted(async () => {
    await getUserHttpTags()
    if (config.mounted) config.mounted()
  })

  const getFormBusinessTagOptions = (data: {
    clearCallback?: () => void
    tagOnCloseCallback?: (data: any[]) => void
    change?: (data: any[], list: any[]) => void
  }) => {
    return {
      on: {
        clear: () => {
          all_select_business_tag_ids.value = []
          if (data?.clearCallback) {
            data.clearCallback()
          }
        },
        change: (e: string[]) => {
          all_select_business_tag_ids.value = e
          if (data?.change) {
            data.change(e, all_select_business_tag_ids.value)
          }
        }
      },
      slots: {
        tag: (options: any) => {
          return (
            <>
              {all_select_business_tag_ids.value.map((item) => {
                if (!item) return <></>
                const result = all_business_tags_list.value.find((e) => e.value == item)
                if (!result) return <></>

                return (
                  <ElTag
                    closable={!disabled.value}
                    type="info"
                    onClose={() => {
                      all_select_business_tag_ids.value = all_select_business_tag_ids.value.filter(
                        (item) => item !== result.value
                      )
                      if (data?.tagOnCloseCallback) {
                        data.tagOnCloseCallback(all_select_business_tag_ids.value)
                      }
                    }}
                  >
                    {result.label}
                  </ElTag>
                )
              })}
            </>
          )
        }
      }
    }
  }

  const getFormContentOptions = (data: {
    clearCallback?: () => void
    tagOnCloseCallback: (data: any[]) => void
  }) => {
    return {
      on: {
        clear: () => {
          all_select_content_tag_ids.value = []
          if (data?.clearCallback) {
            data.clearCallback()
          }
        },
        change: (e: string[]) => {
          all_select_content_tag_ids.value = e
        }
      },
      slots: {
        tag: (options: any) => {
          return (
            <>
              {all_select_content_tag_ids.value.map((item) => {
                if (!item) return <></>
                const result = all_content_tags_list.value.find((e) => e.value == item)
                if (!result) return <></>
                return (
                  <ElTag
                    closable={!disabled.value}
                    type="info"
                    onClose={() => {
                      all_select_content_tag_ids.value = all_select_content_tag_ids.value.filter(
                        (item) => item !== result.value
                      )
                      if (data?.tagOnCloseCallback) {
                        data.tagOnCloseCallback(all_select_content_tag_ids.value)
                      }
                    }}
                  >
                    {result.label}
                  </ElTag>
                )
              })}
            </>
          )
        }
      }
    }
  }

  return {
    mergeBusinessTags,
    mergeContentTags,
    all_content_tags_list,
    all_business_tags_list,
    getFormBusinessTagOptions,
    getFormContentOptions,
    all_select_content_tag_ids,
    all_select_business_tag_ids,
    setDisabled
  }
}
