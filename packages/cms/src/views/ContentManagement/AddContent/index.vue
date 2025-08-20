<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { ref, onMounted } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import type { IDomEditor } from '@wangeditor/editor'
import { BaseButton } from '@/components/Button'
import {
  ElMessage,
  ElMessageBox,
  ElTag,
  ElImage,
  ElButton,
  type FormRules,
  type UploadRequestOptions,
  type UploadRawFile
} from 'element-plus'
import { getDictEags } from '@/api/tag'
import { uploadFile } from '@/api/common/index'
import { createNewsApi, getNewsDetailApi, updateNewsApi } from '@/api/content/index'
import { type ContentItemType } from '@/api/content/types'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getHtmlFirstImageUrl } from '@/utils/index'

let isLeave: boolean = false

const { fullPath, query } = useRoute()
const { replace, go } = useRouter()

const isAdd = ref(true)
const cover_picture_url = ref<string>('')
const uploadLoading = ref(false)
const all_content_tags_list = ref<any[]>([])
const all_select_content_tag_ids = ref<any[]>([])
const all_business_tags_list = ref<any[]>([])
const all_select_business_tag_ids = ref<any[]>([])
const news_detail = ref<ContentItemType>()

const { required, lengthRange, notSpecialCharacters } = useValidator()

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

const beforeUpload = (file: UploadRawFile) => {
  const { size, type } = file
  if (type === 'image/gif') {
    ElMessage.error('上传的文件格式不正确')
    return false
  }
  if (type.startsWith('image')) {
    if (size > 1024 * 1024 * 10) {
      ElMessage.error('上传的图片大小不能超过10MB')
      return false
    }
  }
  return true
}

const httpRequest = async (params: UploadRequestOptions): Promise<{ url: string }> => {
  const { file } = params
  return new Promise<{ url: string }>(async (resolve, reject) => {
    uploadLoading.value = true
    const res = await uploadFile(file)
    uploadLoading.value = false
    if (res?.length) {
      cover_picture_url.value = res
      resolve({ url: res })
    } else {
      reject(Error('上传失败'))
    }
  })
}

const rules: FormRules = {
  title: [
    required('请输入标题'),
    lengthRange({ min: 1, max: 30, message: '资讯标题长度在30字符以内' }),
    notSpecialCharacters('标题不能包含特殊字符')
  ],
  business_tag_id_list: [required('请选择业务标签')],
  content_tag_id_list: [required('请选择内容标签')]
}

const schema = ref<FormSchema[]>([
  {
    field: 'title',
    label: '标题',
    component: 'Input'
  },
  {
    field: 'cover',
    component: 'Upload',
    label: '上传图片',
    componentProps: {
      action: '#',
      httpRequest,
      beforeUpload,
      accept: 'image/*',
      showFileList: false,
      slots: {
        default: () => (
          <>
            <div class="flex">
              {!cover_picture_url.value?.length ? (
                ''
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <ElImage
                    class="h-[100px] mr-10px"
                    src={cover_picture_url.value}
                    fit="cover"
                    lazy
                    preview-src-list={[cover_picture_url.value]}
                    preview-teleported
                  />
                </div>
              )}
              <ElButton class="self-end mb-10px" type="primary">
                点击上传
              </ElButton>
            </div>
          </>
        ),
        tip: () => <div>支持jpg/png格式，文件不大于10mb</div>
      }
    }
  },
  {
    field: 'business_tag_id_list',
    label: '业务标签',
    component: 'Select',
    componentProps: {
      multiple: true,
      options: [],
      on: {
        clear: () => {
          all_select_business_tag_ids.value = []
          setValues({
            business_tag_ids: []
          })
        },
        change: (e: string[]) => {
          all_select_business_tag_ids.value = e
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
                    closable={true}
                    type="info"
                    onClose={() => {
                      all_select_business_tag_ids.value = all_select_business_tag_ids.value.filter(
                        (item) => item !== result.value
                      )
                      setValues({
                        business_tag_id_list: all_select_business_tag_ids.value
                      })
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
  },
  {
    field: 'content_tag_id_list',
    label: '内容标签',
    component: 'Select',
    componentProps: {
      multiple: true,
      options: [],
      on: {
        clear: () => {
          all_select_content_tag_ids.value = []
          setValues({
            content_tag_ids: []
          })
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
                    closable={true}
                    type="info"
                    onClose={() => {
                      all_select_content_tag_ids.value = all_select_content_tag_ids.value.filter(
                        (item) => item !== result.value
                      )
                      setValues({
                        content_tag_id_list: all_select_content_tag_ids.value
                      })
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
  },
  {
    field: 'content',
    component: 'Editor',
    colProps: {
      span: 24
    },
    componentProps: {
      // height: 300,
      defaultHtml: '',
      // @ts-ignore
      onChange: (edit: IDomEditor) => {
        setValues({
          content: edit.getHtml()
        })
      }
    },
    label: '内容'
  }
])

onMounted(async () => {
  isAdd.value = fullPath.includes('add')
  if (!isAdd.value) {
    await getContentDetail(Number(query.id))
  }
  setTags()
})

const getContentDetail = async (id: number) => {
  const res = await getNewsDetailApi({ id })
  if (res.code === 200) {
    news_detail.value = res.data
    cover_picture_url.value = res.data.cover_picture_url ?? ''
    setValues({
      business_tag_id_list: res.data.business_tags?.map((item) => item.id),
      content_tag_id_list: res.data.content_tags?.map((item) => item.id),
      title: res.data.title,
      content: res.data.content
    })
    all_select_business_tag_ids.value = res.data.business_tags?.map((item) => item.id) ?? []
    all_select_content_tag_ids.value = res.data.content_tags?.map((item) => item.id) ?? []
  } else {
    ElMessage.error('获取资讯详情失败')
  }
}

const setTags = async () => {
  const result = await getDictEags({
    category: '2'
  })
  const { business_tags = [], content_tags = [] } = result.data || {}

  const business = (news_detail.value?.business_tags || [])
    .filter((item: any) => {
      return !business_tags.find((business_tag: any) => business_tag.id === item.id)
    })
    .map((item: any) => {
      return { ...item, disabled: true }
    })
  const content = (news_detail.value?.content_tags || [])
    .filter((item: any) => {
      return !content_tags.find((content_tag: any) => content_tag.id === item.id)
    })
    .map((item: any) => {
      return { ...item, disabled: true }
    })
  const content_tags_list = [...content_tags, ...content].map((item: any) => {
    return {
      label: item.name,
      value: item.id,
      disabled: item.disabled
    }
  })

  all_content_tags_list.value = content_tags_list
  const business_tags_list = [...business_tags, ...business].map((item: any) => {
    return {
      label: item.name,
      value: item.id,
      disabled: item.disabled
    }
  })
  all_business_tags_list.value = business_tags_list

  setSchema([
    {
      field: 'business_tag_id_list',
      path: 'componentProps.options',
      value: business_tags_list
    }
  ])

  setSchema([
    {
      field: 'content_tag_id_list',
      path: 'componentProps.options',
      value: content_tags_list
    }
  ])
}

const submitAction = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      const formData = await getFormData<any>()
      const { cover, ...rest } = formData
      if (!formData.content_tag_id_list?.find((id: any) => id === 1 || id === 2 || id === 3)) {
        ElMessage.error('内容标签中的新闻资讯、要事信息、规定事项至少选择一个')
        return
      }
      let backup_cover_url
      if (!cover_picture_url.value?.length) {
        uploadLoading.value = true
        backup_cover_url = await getHtmlFirstImageUrl(formData?.content, Number(query.id))
        uploadLoading.value = false
      }
      const res = isAdd.value
        ? await createNewsApi({
            cover_picture_url: cover_picture_url.value,
            content_picture_url: backup_cover_url,
            ...rest
          })
        : await updateNewsApi({
            cover_picture_url: cover_picture_url.value,
            content_picture_url: backup_cover_url,
            ...rest,
            id: Number(query.id)
          })
      if (res.code === 200) {
        isLeave = true
        replace('/content-management/list')
      } else {
        ElMessage.error('操作失败')
      }
    }
  })
}

const cancelAction = () => {
  go(-1)
}

onBeforeRouteLeave((to, from, next) => {
  if (isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('内容还未保存，是否取消？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    next()
  })
})
</script>

<template>
  <ContentWrap
    class="min-h-[var(--view-context-height)] pl-150px pr-150px"
    v-loading="uploadLoading"
  >
    <BaseButton class="pos-absolute left-40px top-40px" @click="go(-1)"> 返回 </BaseButton>
    <div class="min-h-[calc(var(--view-context-height)-94px)]">
      <div class="text-align-center font-bold">{{ isAdd ? '新增资讯' : '编辑资讯' }}</div>
      <div class="ml-10px mt-30px mb-30px">资讯信息</div>
      <Form :schema="schema" :rules="rules" @register="formRegister" />
    </div>
    <div class="h-[52px] pt-20px border-t-1px border-t-solid border-t-[#409eff]">
      <BaseButton type="primary" @click="submitAction">提交</BaseButton>
      <BaseButton @click="cancelAction">取消</BaseButton>
    </div>
  </ContentWrap>
</template>
