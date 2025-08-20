<script setup lang="tsx">
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { type PropType, reactive, watch, ref } from 'vue'
import { getRoleListApi, getPermissionAllSelection } from '@/api/role'
import { getFileTemplateApi, checkUserExistApi } from '@/api/login/index'
import { onMounted } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { useValidator } from '@/hooks/web/useValidator'
import { ElDivider, ElMessage, type UploadRequestOptions } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { LookStaffDialog } from '@/components/LookStaffDialog'
import { Table, type TableColumn, type TableSlotDefault } from '@/components/Table'
import { Dialog } from '@/components/Dialog'
import { some, includes } from 'lodash-es'

import * as XLSX from 'xlsx'
// 导入的总数据
const allImportUser = ref<any[]>([])
// 导入正常数据
const failImportUser = ref<any[]>([])
// 导入异常数据
const errorImportUser = ref<any[]>([])
// 存储所有用户
const allUsers = ref<any[]>([])

const tagList = ref<any[]>([])
const clientList = ref<any[]>([])
const managerTagList = ref<any[]>([])
const show = ref(false)
const showDialog = ref(false)
const { required, lengthRange, notSpace, notSpecialCharacters } = useValidator()
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getRoleListApi()
    return {
      list: res.data.list || [],
      total: res.data.total
    }
  }
})

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

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
                  error_msg: !/^[a-zA-Z0-9_.+-]+@yidatec\.com$/.test(item.email)
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

const formSchema = ref<FormSchema[]>([
  {
    field: 'role_name',
    label: '角色名称',
    component: 'Input'
  },
  {
    field: 'description',
    label: '角色描述',
    component: 'Input'
  },
  {
    field: 'field83',
    component: 'Upload',
    label: '人员名单',
    componentProps: {
      multiple: false,
      action: '#',
      onExceed: () => {
        ElMessage.warning('最多可上传一个文件!')
      },
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
              导入角色人员名单
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
            <BaseButton
              disabled={allUsers.value.length ? false : true}
              onClick={() => (showDialog.value = true)}
            >
              查看导入人员明细
            </BaseButton>
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
                  a.download = '权限用户录入表.xlsx' // 设置下载后的文件名以及扩展名，按需修改
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
  }
])

const rules = reactive({
  role_name: [
    required(),
    lengthRange({ min: 1, max: 20, message: '角色名称长度在20字符以内' }),
    notSpace(),
    notSpecialCharacters()
  ],
  description: [
    required(),
    lengthRange({ min: 1, max: 50, message: '角色描述长度在50字符以内' }),
    notSpace(),
    notSpecialCharacters()
  ],
  status: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    formData.users = allUsers.value.map((item: any) => {
      return Number(item.id)
    })
    formData.business_tags = tagList.value[0].checkList || []
    formData.content_tags = tagList.value[1].checkList || []
    formData.manager_permissions = managerTagList.value
      .filter((item) => item.checkList && item.checkList.length)
      .map((item) => {
        return {
          id: item.id,
          path: item.api,
          actions: item.checkList
        }
      })
    formData.client_permissions = clientList.value
      .filter((item) => item.checkList && item.checkList.length)
      .map((item) => {
        const checkList = (item.checkList || []).filter((e: string) => {
          if ((item.id == 5 || item.id == 4) && (e == 'DELETE' || e == 'PUT')) {
            return false
          }
          return true
        })
        return { id: item.id, path: item.api, actions: checkList }
      })
    if (formData.users.length == 0) {
      ElMessage.error('角色人员名单尚未导入')
      return false
    }
    if (formData.content_tags.length == 0) {
      ElMessage.error('请选择内容标签')
      return false
    }
    if (formData.business_tags.length == 0) {
      ElMessage.error('请选择业务标签')
      return false
    }
    return formData
  }
}

const { loading } = tableState

const pageColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'title',
    label: '功能'
  },
  {
    field: 'actions',
    label: '权限范围',
    slots: {
      default: ({ row }: TableSlotDefault) => {
        return (
          <>
            <el-checkbox-group v-model={row.checkList}>
              {row.actions?.map((item: any) => {
                let text = '新增'
                if (item === 'GET') {
                  text = '查看'
                } else if (item === 'POST') {
                  if (row.id == 4 || row.id == 5) {
                    text = '考试'
                  } else {
                    text = '新增'
                  }
                } else if (item === 'PUT') {
                  text = '编辑'
                } else if (item === 'DELETE') {
                  text = '删除'
                }
                const list = ['POST', 'PUT', 'DELETE']
                const requiresHuman = [
                  '/knowledge-management/knowledge-view',
                  '/question-management/list',
                  '/training-management/training-view',
                  '/examination-management/examination-view'
                ]
                const isDisabled = row.checkList.find((item: any) => list.includes(item))
                return (
                  <el-checkbox
                    label={text}
                    value={item}
                    disabled={isDisabled && item == 'GET' ? true : false}
                    onChange={(val: any) => {
                      if (item != 'GET') {
                        if (!row.checkList.includes(item)) {
                          row.checkList = ['GET']
                        } else {
                          row.checkList.push('GET')
                          row.checkList = [...new Set([...row.checkList, ...list])]
                        }
                      }

                      /*
                      // 给用户关联一个默认权限
                      if (requiresHuman.includes(row.path) && some(list, element => includes(row.checkList, element))) {
                        managerTagList.value = managerTagList.value.map((v) => {
                          if(v.path === "/user-management" && (v?.checkList || v.checkList?.length === 0)) {
                            return {
                              ...v,
                              checkList: ['GET']
                            }
                          }

                          return v
                        })
                      }
                      */
                    }}
                  >
                    <div class={'flex  flex-wrap w-100%  whitespace-normal line-height-normal'}>
                      {text}
                    </div>
                  </el-checkbox>
                )
              })}
            </el-checkbox-group>
          </>
        )
      }
    }
  }
])

const tagColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'label',
    label: '分类',
    slots: {
      default: ({ row }: TableSlotDefault) => {
        return (
          <div class={'flex'}>
            <span class={'text-red-500'}>*</span> <div>{row.label}</div>
          </div>
        )
      }
    }
  },
  {
    field: 'actions',
    label: '权限范围',
    slots: {
      default: ({ row }: TableSlotDefault) => {
        return (
          <div class={'flex  flex-wrap'}>
            <el-checkbox-group v-model={row.checkList}>
              {row.tags?.map((item: any) => {
                return (
                  <el-checkbox label={item.name} value={item.id} class={'mt-10px'}>
                    <div class={'flex  flex-wrap w-100%  whitespace-normal line-height-normal'}>
                      {item.name}
                    </div>
                  </el-checkbox>
                )
              })}
            </el-checkbox-group>
          </div>
        )
      }
    }
  }
])

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    const { item } = props.currentRow || { item: {} }
    setValues(item)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})

onMounted(async () => {
  const result = await getPermissionAllSelection()

  if (result.code == 200) {
    const { business_tag = [], content_tag = [], page } = result.data
    const { client = [], manager = [] } = page || {}

    tagList.value = [
      {
        label: '业务标签',
        value: 'business_tag',
        checkList: props.currentRow?.business_tags || [],
        tags: business_tag
      },
      {
        label: '内容标签',
        value: 'content_tag',
        checkList: props.currentRow?.content_tags || [],
        tags: content_tag
      }
    ]

    const paths = Object.keys(props.currentRow?.pages || {})

    clientList.value = client.map((item: any) => {
      if (paths.includes(item.api)) {
        item.checkList = props.currentRow ? props.currentRow?.pages[item.api]?.item : []
      } else {
        item.checkList = []
      }

      return item
    })

    allUsers.value = props.currentRow?.item?.users || []

    managerTagList.value = manager.map((item: any) => {
      if (paths.includes(item.api)) {
        item.checkList = props.currentRow ? props.currentRow?.pages[item.api]?.item : []
      } else {
        item.checkList = []
      }
      return item
    })
  }
})

const save = (data: any) => {
  allUsers.value = data
}

const submitImport = async () => {
  const newUser = failImportUser.value.filter((item: any) => {
    return !allUsers.value.find((user: any) => user.email === item.email)
  })
  allUsers.value = [...allUsers.value, ...newUser]
  show.value = false
}
</script>

<template>
  <el-divider content-position="left">权限信息</el-divider>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  <el-divider content-position="left">客户端权限</el-divider>
  <Table
    :columns="pageColumns"
    default-expand-all
    node-key="id"
    :data="clientList"
    :loading="loading"
    @register="tableRegister"
    :show-overflow-tooltip="false"
  />
  <el-divider content-position="left">管理端权限</el-divider>
  <Table
    :columns="pageColumns"
    default-expand-all
    node-key="id"
    :data="managerTagList"
    :loading="loading"
    @register="tableRegister"
    :show-overflow-tooltip="false"
  />
  <el-divider content-position="left">标签权限</el-divider>
  <Table
    :columns="tagColumns"
    default-expand-all
    node-key="id"
    :data="tagList"
    :loading="loading"
    @register="tableRegister"
    :show-overflow-tooltip="false"
  />

  <LookStaffDialog v-model:model-value="showDialog" :data-list="allUsers" @save="save" />

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
