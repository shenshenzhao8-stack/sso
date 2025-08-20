<script setup lang="tsx">
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { reactive, watch, ref, onMounted } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import type { IDomEditor } from '@wangeditor/editor'
import { BaseButton } from '@/components/Button'
import { ElDivider, ElMessage, ElMessageBox, type UploadRequestOptions, ElTag } from 'element-plus'
import { LookStaffDialog } from '@/components/LookStaffDialog'
import * as XLSX from 'xlsx'
import { checkUserExistApi, getFileTemplateApi } from '@/api/login'
import { uploadFile as HttpUploadFile } from '@/api/common/index'
import { useUserTags } from '@/hooks/web/useUserTags'

const emits = defineEmits(['save', 'cancel', 'isNeedExamChange'])
// 导入的总数据
const allImportUser = ref<any[]>([])
// 导入正常数据
const failImportUser = ref<any[]>([])
// 导入异常数据
const errorImportUser = ref<any[]>([])
// 存储所有用户
const allUsers = ref<any[]>([])

const all_select_content_tag_ids = ref<any[]>([])

const all_select_business_tag_ids = ref<any[]>([])
const show = ref<boolean>(false)
const showDialog = ref(false)
const { required, lengthRange, notSpace } = useValidator()
const props = defineProps({
  echoData: {
    type: Object,
    default: () => null
  },

  disabled: {
    type: Boolean,
    default: false
  }
})

const {
  mergeBusinessTags,
  mergeContentTags,
  all_content_tags_list,
  all_business_tags_list,
  getFormBusinessTagOptions,
  getFormContentOptions,
  setDisabled
} = useUserTags({
  disabled: props.disabled,
  mounted: () => {
    setDisabled(props.disabled)
    setTags()
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods
const cover = ref<string>('')
const uploadFile = (params: UploadRequestOptions): Promise<void> => {
  const { file } = params

  return new Promise((resolve, reject) => {
    try {
      const excelist = ['xls', 'xlsx']
      const list = (file as File).name.split('.')
      if (!excelist.includes(list[list.length - 1])) {
        ElMessage.error('只支持xls、xlsx格式')
        resolve()
        return false
      }

      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = async function (e: any) {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 1 })
          const userInfos = jsonData.filter((item: any) => item && item !== 'undefined' && item[0])
          const newUserInfos = [...new Set(userInfos)]
          const users = newUserInfos.map((user: any) => {
            return {
              email: user[0] ? user[0] + '' : '',
              name: user[1] || ''
            }
          })
          const emails = users.map((user) => user.email)
          const res = await checkUserExistApi({ emails: emails as string[] })
          if (res.code === 200) {
            show.value = true
            allImportUser.value = users
            // 正常用户
            failImportUser.value = (
              res.data?.exits?.map((item) => ({
                ...item
              })) ?? []
            ).filter((item) => item.status == 1)

            // 异常用户
            errorImportUser.value = allImportUser.value
              .filter((bItem) => !failImportUser.value.find((fItem) => bItem.email === fItem.email))
              .map((item) => {
                const result = res.data?.exits?.find((e) => e.email === item.email)
                const data = { ...item, ...(result || {}) }
                return {
                  ...data,
                  error_msg: !/^[a-zA-Z0-9_.+-]+@yidatec\.com$/.test(data.email)
                    ? '用户邮箱格式错误'
                    : data?.status == 2
                      ? '用户已离职'
                      : '用户不在白名单'
                }
              })
          } else {
            ElMessage.error('检查用户是否存在失败')
          }
          resolve()
        } catch (error: any) {
          ElMessage.error(error.message || '文件解析失败')
          reject(error)
        }
      }
      reader.onerror = (error) => {
        ElMessage.error('文件读取失败')
        reject(error)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '文件获取失败')
      reject(error)
    }
  })
}

const schema = ref<FormSchema[]>([
  {
    field: 'batch',
    label: '期数',
    component: 'Input',
    componentProps: {
      disabled: true,
      placeholder: '期数'
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
    field: 'business_tag_ids',
    label: '业务标签',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'content_tag_ids',
    label: '内容标签',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'cover',
    component: 'Upload',
    label: '上传封面图',
    componentProps: {
      multiple: false,
      action: '#',
      onExceed: () => {
        ElMessage.warning('最多可上传一个文件!')
      },
      showFileList: false,
      httpRequest: async ({ file }: { file: File }) => {
        const validTypes = ['image/jpeg', 'image/png']

        if (!validTypes.includes(file.type)) {
          ElMessage.error('请上传 JPG 或 PNG 格式的图片文件')
          return false
        }
        // 限制文件大小（例如：最大 10MB）
        if (file.size > 10 * 1024 * 1024) {
          ElMessage.error('文件大小不能超过 10MB')
          return false
        }

        const src = await HttpUploadFile(file)
        cover.value = src || ''
      },
      slots: {
        default: () => {
          return (
            <div class="flex items-center flex-col">
              {cover.value ? (
                <el-image
                  class="w-[200px]"
                  src={cover.value}
                  preview-src-list={[cover.value]}
                  fit="cover"
                  onClick={(e: Event) => {
                    e.stopPropagation()
                  }}
                />
              ) : (
                <></>
              )}
              <div class={'flex'}>
                {cover.value ? (
                  <div
                    class={'m-r10px'}
                    onClick={(e: Event) => {
                      e.stopPropagation()
                    }}
                  >
                    <BaseButton
                      type="danger"
                      class={'m-t10px '}
                      onClick={() => {
                        ElMessageBox.confirm('确定删除吗？', '提示', {
                          confirmButtonText: '确定',
                          cancelButtonText: '取消',
                          type: 'warning'
                        }).then(() => {
                          cover.value = ''
                        })
                      }}
                    >
                      删除
                    </BaseButton>
                  </div>
                ) : (
                  <></>
                )}
                <BaseButton type="primary" class={'m-t10px'}>
                  点击上传
                </BaseButton>
              </div>
            </div>
          )
        },
        tip: () => <div class="el-upload__tip"> 支持jpg/png格式，文件不大于10mb</div>
      }
    }
  },
  {
    field: 'is_need_exam',
    label: '是否考试',
    component: 'RadioGroup',
    formItemProps: {
      rules: [required()]
    },
    value: true,
    componentProps: {
      options: [
        {
          label: '是',
          value: true
        },
        {
          label: '否',
          value: false
        }
      ],
      on: {
        change: (e: boolean) => {
          emits('isNeedExamChange', e)
        }
      }
    }
  },
  {
    field: 'users',
    component: 'Upload',
    label: '参与考试人员',
    formItemProps: {
      slots: {
        label: () => {
          return (
            <div>
              <span class={'text-[var(--el-color-danger)]'}>*</span>
              <span>参与考试人员</span>
            </div>
          )
        }
      }
    },
    componentProps: {
      multiple: false,
      action: '#',

      showFileList: false,
      httpRequest: uploadFile,
      style: {
        width: '100%',
        display: 'flex'
      },
      class: 'form-upload',
      slots: {
        default: () => (
          <div class="w-[100%]">
            <BaseButton class="w-[100%]" type="primary">
              导入参与考试人员清单表
            </BaseButton>
          </div>
        )
      }
    }
  },
  {
    field: 'field69-1',
    component: 'Input',
    label: `参与考试人员`,
    formItemProps: {
      slots: {
        label: ({ label }) => {
          return (
            <div
              class={`el-button ${allUsers.value.length == 0 ? 'is-disabled' : ''}`}
              onClick={() => {
                if (allUsers.value.length == 0) return
                showDialog.value = true
              }}
            >
              查看导入人员明细
            </div>
          )
        },
        default: (formModel: any) => {
          return (
            <div>
              <BaseButton
                onClick={async () => {
                  const res = await getFileTemplateApi({ type: 2 })
                  const url = URL.createObjectURL(res.data)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = '用户录入表.xlsx' // 设置下载后的文件名以及扩展名，按需修改
                  a.click()
                  URL.revokeObjectURL(url) // 释放临时URL
                }}
              >
                下载导入模版
              </BaseButton>
            </div>
          )
        }
      }
    }
  },

  {
    field: 'start_at',
    label: '开始时间',
    component: 'DatePicker',
    componentProps: {
      type: 'datetime'
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'end_at',
    label: '结束时间',
    component: 'DatePicker',
    componentProps: {
      type: 'datetime'
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'description',
    component: 'Editor',
    colProps: {
      span: 24
    },
    componentProps: {
      // height: 300,
      defaultHtml: '',
      editorConfig: {
        readOnly: props.disabled
      },
      // @ts-ignore
      onChange: (edit: IDomEditor) => {
        setValues({
          description: edit.getHtml()
        })
      }
    },
    label: '内容简介'
  }
])

const rules = reactive({
  title: [required()],
  start_at: [
    required(),
    {
      validator: (rule, value, callback) => {
        const startDate = new Date(value)
        formMethods.getFormData().then((result) => {
          const endDate = new Date(result.end_at)
          if (value && result.end_at && startDate >= endDate) {
            callback(new Error('开始时间必须小于结束时间'))
          } else {
            callback()
          }
        })
      },
      trigger: 'change'
    }
  ],
  end_at: [
    required(),
    {
      validator: (rule, value, callback) => {
        const endDate = new Date(value)
        formMethods.getFormData().then((result) => {
          const startDate = new Date(result.start_at)
          if (value && result.start_at && endDate <= startDate) {
            callback(new Error('结束时间必须大于开始时间'))
          } else {
            callback()
          }
        })
      },
      trigger: 'change'
    }
  ]
})

const setUser = async (data: any) => {
  allUsers.value = data
}

watch(
  () => props.echoData?.id,
  (id) => {
    if (!props.echoData) return
    const {
      batch,
      business_tags,
      content_tags,
      description,
      start_at,
      title,
      end_at,
      users_info,
      is_need_exam
    } = props.echoData
    cover.value = props.echoData.cover
    allUsers.value = users_info || []
    const business_tag_ids = business_tags?.map((item: any) => item.id) || []
    const content_tag_ids = content_tags?.map((item: any) => item.id) || []

    setValues({
      batch,
      description,
      start_at,
      title,
      end_at,
      is_need_exam,
      business_tag_ids: business_tag_ids,
      content_tag_ids: content_tag_ids
    })
    emits('isNeedExamChange', is_need_exam ? true : false)
    all_select_business_tag_ids.value = business_tag_ids
    all_select_content_tag_ids.value = content_tag_ids
  },
  {
    deep: true,
    immediate: true
  }
)

const submitImport = async () => {
  const newUser = failImportUser.value.filter((item: any) => {
    return !allUsers.value.find((user: any) => user.email === item.email)
  })
  setUser([...allUsers.value, ...newUser])
  show.value = false
}

const setTags = async () => {
  const elForm = await getElFormExpose()

  mergeBusinessTags(props.echoData?.business_tags || [])
  mergeContentTags(props.echoData?.content_tags || [])
  setSchema([
    {
      field: 'business_tag_ids',
      path: 'componentProps',
      value: {
        multiple: true,
        options: all_business_tags_list.value,
        ...getFormBusinessTagOptions({
          clearCallback() {
            setValues({
              business_tag_ids: undefined
            })
          },
          tagOnCloseCallback: (tag: any) => {
            setValues({
              business_tag_ids: tag
            })
          }
        })
      }
    },
    {
      field: 'content_tag_ids',
      path: 'componentProps',
      value: {
        multiple: true,
        options: all_content_tags_list.value,
        ...getFormContentOptions({
          clearCallback() {
            setValues({
              content_tag_ids: []
            })
          },
          tagOnCloseCallback: (tag: any) => {
            setValues({
              content_tag_ids: tag
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

const isShow = ref(true)

watch(
  () => props.disabled,
  (val) => {
    isShow.value = false
    setTimeout(() => {
      isShow.value = true
    }, 100)
  },
  {
    immediate: true
  }
)

const getSubmitDate = async () => {
  const formData = await getFormData()
  const {
    business_tag_ids,
    batch,
    content_tag_ids,
    description,
    start_at,
    title,
    end_at,
    is_need_exam
  } = formData

  return {
    business_tag_ids,
    content_tag_ids,
    description,
    start_at,
    title,
    batch,
    is_need_exam,
    users: allUsers.value.map((item) => item.id),
    cover: cover.value,
    end_at,
    users_info: allUsers.value
  }
}

const submit = async () => {
  const elForm = await getElFormExpose()

  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })

  if (valid) {
    if (allUsers.value.length == 0) {
      ElMessage.warning('请选择参与考试人员')
      return false
    }
    const result = await getSubmitDate()
    return result
  } else {
    return false
  }
}

defineExpose({
  submit,
  getSubmitDate,
  all_business_tags_list: all_business_tags_list,
  all_content_tags_list: all_content_tags_list,
  setTags
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="schema" :disabled="disabled" />

  <LookStaffDialog
    v-model:model-value="showDialog"
    :data-list="allUsers"
    @save="setUser"
    :disabled="disabled"
  />

  <Dialog v-model="show" title="导入人员名单" width="600" :max-height="300">
    <div class="px-15px">
      <span>{{
        `共${allImportUser.length}条数据，预计成功导入${allImportUser.length - errorImportUser.length}条数据`
      }}</span>
      <span v-if="errorImportUser.length">，</span>
      <span class="text-red" v-if="errorImportUser.length">{{
        `失败${errorImportUser.length}条数据`
      }}</span>
    </div>
    <div class="text-red mt-10px mb-10px font-700 px-15px" v-if="errorImportUser.length">
      导入失败数据：
    </div>
    <div class="px-15px" v-if="errorImportUser.length">
      <div class="text-red" v-for="item in errorImportUser" :key="item.email">
        <span class="mr-20px">{{ item.email }}</span>
        <span>{{ item.error_msg }}</span>
      </div>
    </div>
    <template #footer>
      <BaseButton
        type="primary"
        @click="submitImport"
        :disabled="allImportUser.length - errorImportUser.length < 1"
        >确认导入</BaseButton
      >
      <BaseButton @click="show = false">取消</BaseButton>
    </template>
  </Dialog>
</template>

<style lang="less" scoped>
:deep(.form-upload) {
  > div {
    width: 100%;
  }
}
</style>
