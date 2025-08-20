<script setup lang="tsx">
import { reactive, ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import {
  type FormRules,
  ElMessageBox,
  ElMessage,
  type UploadRequestOptions,
  type UploadRawFile,
  ElButton,
  ElImage,
  ElTag
} from 'element-plus'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { uploadFile } from '@/api/common/index'
import { getDictEags } from '@/api/tag/index'
import {
  createBannerApi,
  deleteBannerApi,
  getBannerDetailApi,
  updateBannerApi
} from '@/api/banner/index'
import { type BannerItemType } from '@/api/banner/types'
import { detailPageHasHandlePermission } from '@/utils/index'

let isLeave: boolean = false

const { fullPath, query } = useRoute()
const { go, push } = useRouter()

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues, setSchema } = formMethods
const { required, lengthRange } = useValidator()

const rules: FormRules = {
  title: [
    required('请输入标题'),
    lengthRange({ min: 1, max: 30, message: 'Banner标题长度在30字符以内' })
  ],
  business_tag_id_list: [required('请选择业务标签')],
  content_tag_id_list: [required('请选择内容标签')]
}

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
      picture_url.value = res
      resolve({ url: res })
    } else {
      reject(Error('上传失败'))
    }
  })
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    label: '标题',
    value: '',
    component: 'Input',
    componentProps: {
      placeholder: '请输入标题'
    }
  },
  {
    field: 'target_url',
    label: '跳转链接',
    value: '',
    component: 'Input',
    componentProps: {
      placeholder: '请输入跳转链接'
    }
  },
  {
    field: 'picture',
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
              {!picture_url.value?.length ? (
                ''
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <ElImage
                    class="h-[100px] mr-10px"
                    src={picture_url.value}
                    fit="cover"
                    lazy
                    preview-src-list={[picture_url.value]}
                    preview-teleported
                  />
                </div>
              )}
              {isDetail.value ? (
                ''
              ) : (
                <ElButton class="self-end mb-10px" type="primary">
                  点击上传
                </ElButton>
              )}
            </div>
          </>
        ),
        tip: () => <div>支持jpg、png格式图片大小不超过10MB</div>
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
                    closable={!isDetail.value}
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
                    closable={!isDetail.value}
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
  }
])

const isAdd = ref(true)
const isDetail = ref(false)
const uploadLoading = ref(false)
const picture_url = ref('')
const all_content_tags_list = ref<any[]>([])
const all_select_content_tag_ids = ref<any[]>([])
const all_business_tags_list = ref<any[]>([])
const all_select_business_tag_ids = ref<any[]>([])
const banner_detail = ref<BannerItemType>()

onMounted(async () => {
  isAdd.value = fullPath.includes('add')
  isDetail.value = fullPath.includes('detail')
  if (!isAdd.value) {
    await getBannerDetail(Number(query.id))
  }
  setTags()
})

const setTags = async () => {
  const result = await getDictEags()
  const { business_tags = [], content_tags = [] } = result.data || {}

  const business = (banner_detail.value?.business_tags || [])
    .filter((item: any) => {
      return !business_tags.find((business_tag: any) => business_tag.id === item.id)
    })
    .map((item: any) => {
      return { ...item, disabled: true }
    })
  const content = (banner_detail.value?.content_tags || [])
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

const getBannerDetail = async (id: number) => {
  const res = await getBannerDetailApi({ id })
  if (res.code === 200) {
    banner_detail.value = res.data
    const { business_tags, content_tags, title, target_url } = res.data
    setValues({
      title,
      target_url,
      business_tag_id_list: business_tags.map((item: any) => item.id),
      content_tag_id_list: content_tags.map((item: any) => item.id)
    })
    picture_url.value = res.data.picture_url
    all_select_business_tag_ids.value = res.data.business_tags?.map((item) => item.id) ?? []
    all_select_content_tag_ids.value = res.data.content_tags?.map((item) => item.id) ?? []
  } else {
    ElMessage.error('获取Banner详情失败')
  }
}

const submitAction = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      const formData = await getFormData<any>()
      const { picture, ...rest } = formData
      if (!picture_url.value.length) {
        ElMessage.error('请上传图片')
        return
      }
      if (formData.target_url?.length && !/^https?:\/\//.test(formData.target_url)) {
        ElMessage.error('跳转链接不合法')
        return
      }
      const res = isAdd.value
        ? await createBannerApi({
            picture_url: picture_url.value,
            ...rest
          })
        : await updateBannerApi({
            picture_url: picture_url.value,
            ...rest,
            id: Number(query.id)
          })
      if (res.code === 200) {
        ElMessage.success(isAdd.value ? '新增Banner成功' : '更新Banner成功')
        isLeave = true
        go(-1)
      } else {
        if (res.code === 2) {
          ElMessage.error(isAdd.value ? '新增Banner失败，标题已存在' : '更新Banner失败，标题已存在')
        } else {
          ElMessage.error(isAdd.value ? '新增Banner失败' : '更新Banner失败')
        }
      }
    }
  })
}

const editAction = () => {
  push({
    path: '/banner-management/edit',
    query: {
      id: query.id
    }
  })
}

const cancelAction = () => {
  go(-1)
}

const deleteAction = async () => {
  ElMessageBox.confirm('确定删除该Banner？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteBannerApi({ id: Number(query.id) })
    if (res.code === 200) {
      ElMessage.success('删除Banner成功')
      go(-1)
    } else {
      ElMessage.error('删除Banner失败')
    }
  })
}

onBeforeRouteLeave((to, from, next) => {
  if (isDetail.value || isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('Banner信息还未保存，是否取消？', '提示', {
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
      <div class="text-align-center font-bold">
        {{ isAdd ? '新增Banner' : isDetail ? '详细信息' : '编辑信息' }}
      </div>
      <div class="ml-10px mt-30px mb-30px">Banner信息</div>
      <Form :schema="schema" :rules="rules" @register="formRegister" :disabled="isDetail" />
    </div>
    <div
      v-if="!isDetail || detailPageHasHandlePermission(8)"
      class="h-[52px] pt-20px border-t-1px border-t-solid border-t-[#409eff]"
    >
      <BaseButton v-if="!isDetail" type="primary" @click="submitAction">提交</BaseButton>
      <BaseButton v-else type="primary" @click="editAction">编辑</BaseButton>
      <BaseButton v-if="!isDetail" @click="cancelAction">取消</BaseButton>
      <BaseButton v-else type="danger" @click="deleteAction">删除</BaseButton>
    </div>
  </ContentWrap>
</template>
