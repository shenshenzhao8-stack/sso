<script setup lang="tsx">
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { reactive, watch, ref, computed } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import type { IDomEditor } from '@wangeditor/editor'
import { BaseButton } from '@/components/Button'
import { ElLoading, ElMessage } from 'element-plus'
import LookFileDialog from './LookFileDialog.vue'
import { uploadFile as HttpUploadFile } from '@/api/common/index'
import { useUserTags } from '@/hooks/web/useUserTags'
import { htmlHasContent } from '@/utils/index'

const emits = defineEmits(['showEventTracking'])

const all_select_content_tag_ids = ref<any[]>([])
const all_select_business_tag_ids = ref<any[]>([])
const show = ref<boolean>(false)
const lookFileDialogRef = ref<InstanceType<typeof LookFileDialog>>()

const { required, lengthRange, notSpace } = useValidator()
const props = defineProps({
  echoData: {
    type: Object,
    default: () => null
  },
  btnLoading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

let userSelectFileList: File[] = []
const fileList = ref<any[]>([])
let timer: any = null
const isUserSend = ref(true)

const {
  mergeBusinessTags,
  mergeContentTags,
  all_content_tags_list,
  all_business_tags_list,
  getFormBusinessTagOptions,
  getFormContentOptions,
  all_select_content_tag_ids: content_tag_id_list,
  setDisabled
} = useUserTags({
  disabled: props.disabled,
  tagsParms: {
    category: '1,3'
  },
  mounted: () => {
    setTimeout(() => {
      setDisabled(props.disabled)
      setTags()
    }, 200)
  }
})

const schema = ref<FormSchema[]>([
  {
    field: 'business_tag_id_list',
    label: '业务标签',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'content_tag_id_list',
    label: '内容标签',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    formItemProps: {
      rules: [
        required(),
        lengthRange({ min: 1, max: 30, message: '标题长度在30字符以内' }),
        notSpace()
      ]
    }
  },
  {
    field: 'cover',
    component: 'Upload',
    label: '附件上传',
    componentProps: {
      action: '#',
      multiple: true,
      showFileList: false,

      httpRequest: async ({ file }: { file: File }) => {
        const number = 10

        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'application/pdf', // .pdf
          'application/zip', // .zip
          'application/x-rar-compressed', // RAR
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/x-gzip',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ]

        const callback = () => {
          isUserSend.value = false
          userSelectFileList = []
          clearTimeout(timer)
          setTimeout(() => {
            isUserSend.value = true
          }, 1000)
        }
        if (!isUserSend.value) return

        if (!allowedTypes.includes(file.type)) {
          ElMessage.error(`文件 ${file.name} 类型不支持`)
          callback()
          return
        }

        if (file.size > 100 * 1024 * 1024) {
          ElMessage.error(`${file.name}文件大小不能超过 100MB`)
          callback()
          return
        }
        userSelectFileList.push(file)

        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        timer = setTimeout(() => {
          if (fileList.value.length + userSelectFileList.length > number) {
            ElMessage.error(
              `最多上传${number}个附件，您已上传${fileList.value.length} ，本次选择${userSelectFileList.length}个文件，请删除后重新上传`
            )
            callback()
            return
          }
          const loadingInstance = ElLoading.service({
            lock: true,
            text: '上传中...',
            background: 'rgba(0, 0, 0, 0.7)'
          })

          const newPromist = userSelectFileList.map((item) => {
            return HttpUploadFile(item)
          })

          Promise.all(newPromist)
            .then((newUrlList) => {
              fileList.value = [...fileList.value, ...newUrlList]
              ElMessage.success('上传成功')
            })
            .finally(() => {
              userSelectFileList = []
              loadingInstance.close()
            })
        }, 500)
      },
      slots: {
        default: () => {
          return (
            <div class="flex items-center ">
              <div
                class={'m-r10px '}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {fileList.value.length ? (
                  <div
                    class="el-button el-button--success"
                    onClick={() => {
                      show.value = true
                    }}
                  >
                    预览附件
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <BaseButton type="primary">点击上传</BaseButton>
            </div>
          )
        },
        tip: () => (
          <div class="el-upload__tip"> 支持上传文档、图片、压缩包等附件信息，文件不大于100mb</div>
        )
      }
    }
  },

  {
    field: 'content',
    component: 'Editor',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        label: () => {
          return (
            <div>
              <span class={'text-[var(--el-color-danger)]'}>*</span>
              <span>内容简介</span>
            </div>
          )
        }
      }
    },
    componentProps: {
      // height: 300,

      defaultHtml: '',
      editorConfig: {
        readOnly: false
      },
      // @ts-ignore
      onChange: (edit: IDomEditor) => {
        setValues({
          content: edit.getHtml()
        })
      }
    },
    label: '内容简介'
  }
])

const rules = reactive({
  title: [required()]
})

watch(
  () => props.echoData,
  (echoData) => {
    if (!echoData) return
    const {
      batch,
      business_tags,
      content_tags,
      content,
      start_at,
      title,
      end_at,
      attachment_file_list
    } = echoData

    const business_tag_id_list = business_tags?.map((item: any) => item.id) || []
    const content_tag_id_list = content_tags?.map((item: any) => item.id) || []
    setValues({
      batch,
      content,
      start_at,
      title,
      end_at,
      business_tag_id_list: business_tag_id_list,
      content_tag_id_list: content_tag_id_list
    })
    all_select_business_tag_ids.value = business_tag_id_list
    all_select_content_tag_ids.value = content_tag_id_list
    fileList.value = attachment_file_list || []
  },
  {
    deep: true,
    immediate: true
  }
)

const setTags = async () => {
  const elForm = await getElFormExpose()

  mergeBusinessTags(props.echoData?.business_tags || [])
  mergeContentTags(props.echoData?.content_tags || [])
  setSchema([
    {
      field: 'business_tag_id_list',
      path: 'componentProps',
      value: {
        multiple: true,
        options: all_business_tags_list.value,
        ...getFormBusinessTagOptions({
          clearCallback() {
            setValues({
              business_tag_id_list: undefined
            })
          },
          tagOnCloseCallback: (tag: any) => {
            setValues({
              business_tag_id_list: tag
            })
          }
        })
      }
    },
    {
      field: 'content_tag_id_list',
      path: 'componentProps',
      value: {
        multiple: true,
        options: all_content_tags_list.value,
        ...getFormContentOptions({
          clearCallback() {
            setValues({
              content_tag_id_list: []
            })
          },
          tagOnCloseCallback: (tag: any) => {
            setValues({
              content_tag_id_list: tag
            })
          }
        })
      }
    }
  ])
  setTimeout(() => {
    elForm?.clearValidate()
  }, 0)
}

const submit = async () => {
  const elForm = await getElFormExpose()

  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })

  if (valid) {
    const formData = await getFormData()
    const { business_tag_id_list, content_tag_id_list, content, title } = formData

    const result = htmlHasContent(content)
    if (!result) {
      ElMessage.error('内容简介不能为空')
      return false
    }

    return {
      business_tag_id_list,
      content_tag_id_list,
      content,
      title,
      business_tags: business_tag_id_list.map((item: any) => {
        const result = all_business_tags_list.value.find((e) => e.value == item) || {}
        return {
          ...result,
          name: result?.label
        }
      }),
      content_tags: content_tag_id_list.map((item: any) => {
        const result = all_content_tags_list.value.find((e) => e.value == item) || {}
        return {
          ...result,
          name: result?.label
        }
      }),
      attachment_file_list: fileList.value,
      process_schedule_list: []
    }
  } else {
    return false
  }
}

const lookFileSubmit = async (data: any) => {
  fileList.value = data.map((item: any) => item.title)
}

watch(
  () => content_tag_id_list.value.length,
  (val) => {
    emits('showEventTracking', isShow.value)
  }
)

const isShow = computed(() => {
  const result = content_tag_id_list.value.find((item) => {
    const result = all_content_tags_list.value.find((e) => e.value == item)
    return result?.value == 4
  })
  if (result) return true
  return false
})

defineExpose({
  submit
})
</script>

<template>
  <Form
    :labelWidth="100"
    :rules="rules"
    @register="formRegister"
    :schema="schema"
    :disabled="disabled"
  />
  <LookFileDialog
    v-model:model-value="show"
    :file-list="fileList"
    :disabled="disabled"
    ref="lookFileDialogRef"
    @submit="lookFileSubmit"
  />
</template>

<style lang="less" scoped>
:deep(.form-upload) {
  > div {
    width: 100%;
  }
}
</style>
