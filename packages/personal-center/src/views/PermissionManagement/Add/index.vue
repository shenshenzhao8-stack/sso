<script setup lang="tsx">
import { reactive, ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import {
  type FormRules,
  ElMessageBox,
  ElMessage,
  ElSwitch,
  type UploadRequestOptions
} from 'element-plus'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { Table, type TableColumn } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { LookStaffDialog } from '@/components/LookStaffDialog'
import { Dialog } from '@/components/Dialog'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getFileTemplateApi, checkUserExistApi } from '@/api/common/index'
import {
  getRolePermissionListApi,
  createRoleApi,
  getRoleDetailApi,
  updateRoleApi
} from '@/api/permission/index'
import type { RoleItemType, RolePermissionsInfoType } from '@/api/permission/types'
import * as XLSX from 'xlsx'

const isAdd = ref(true)
const role_detail = ref<RoleItemType>()
// 导入的总数据
const allImportUser = ref<any[]>([])
// 导入正常数据
const failImportUser = ref<any[]>([])
// 导入异常数据
const errorImportUser = ref<any[]>([])
// 存储所有用户
const allUsers = ref<any[]>([])
const showAllUsersDialog = ref(false)
const showImportResultDialog = ref(false)
const tableDataList = ref<RolePermissionsInfoType[]>([])

let isLeave: boolean = false

const { fullPath, query } = useRoute()
const { go } = useRouter()

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues } = formMethods
const { required, lengthRange, notSpecialCharacters } = useValidator()

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
            showImportResultDialog.value = true
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

const rules: FormRules = {
  name: [
    required('请输入角色名称'),
    lengthRange({ min: 1, max: 20, message: '角色名称长度在20字符以内' }),
    notSpecialCharacters('角色名称不能包含特殊字符')
  ],
  description: [
    required('请输入角色描述'),
    lengthRange({ min: 1, max: 50, message: '角色描述长度在50字符以内' }),
    notSpecialCharacters('角色描述不能包含特殊字符')
  ]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '角色名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入角色名称'
    }
  },
  {
    field: 'description',
    label: '角色描述',
    component: 'Input',
    componentProps: {
      placeholder: '请输入角色描述'
    }
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
              onClick={() => (showAllUsersDialog.value = true)}
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

const columns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'name',
    label: '系统名称'
  },
  {
    field: 'selected',
    label: '权限设置',
    slots: {
      default: (data: any) => {
        const row = data.row as RolePermissionsInfoType
        return (
          <>
            <ElSwitch v-model={row.selected} />
          </>
        )
      }
    }
  }
])

onMounted(async () => {
  isAdd.value = fullPath.includes('add')
  await getAllPermissionList()
  if (!isAdd.value) {
    await getRoleDetail(Number(query.id))
  }
})

const getRoleDetail = async (id: number) => {
  const res = await getRoleDetailApi({ id })
  if (res.code === 200) {
    role_detail.value = res.data
    setValues({
      name: res.data.name,
      description: res.data.description
    })
    allUsers.value = res.data.role_users_info
    tableDataList.value.forEach((item) => {
      item.selected = res.data.role_permissions_info.some((p) => p.id === item.id)
    })
  }
}

const save = (data: any) => {
  allUsers.value = data
}

const submitImport = () => {
  const newUser = failImportUser.value.filter((item: any) => {
    return !allUsers.value.find((user: any) => user.email === item.email)
  })
  allUsers.value = [...allUsers.value, ...newUser]
  showImportResultDialog.value = false
}

const saveAction = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      const formData = await getFormData<any>()
      if (!allUsers.value?.length) {
        ElMessage.error('请导入人员名单')
        return
      }
      if (isAdd.value) {
        const res = await createRoleApi({
          name: formData.name,
          description: formData.description,
          users: allUsers.value.map((item) => item.id),
          permissions: tableDataList.value.filter((item) => item.selected).map((item) => item.id)
        })
        if (res.code === 200) {
          isLeave = true
          ElMessage.success('保存成功')
          go(-1)
        } else if (res.code === 100001) {
          ElMessage.error('角色名称已存在')
        } else {
          ElMessage.error('保存失败')
        }
      } else {
        if (!role_detail.value?.id) return
        const res = await updateRoleApi({
          id: role_detail.value.id,
          name: formData.name,
          description: formData.description,
          users: allUsers.value.map((item) => item.id),
          permissions: tableDataList.value.filter((item) => item.selected).map((item) => item.id)
        })
        if (res.code === 200) {
          isLeave = true
          ElMessage.success('更新成功')
          go(-1)
        } else if (res.code === 100001) {
          ElMessage.error('角色名称已存在')
        } else {
          ElMessage.error('更新失败')
        }
      }
    }
  })
}

const closeAction = () => {
  go(-1)
}

onBeforeRouteLeave((to, from, next) => {
  if (isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('权限信息还未保存，是否取消？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    next()
  })
})

const getAllPermissionList = async () => {
  const res = await getRolePermissionListApi()
  if (res.code === 200) {
    tableDataList.value = res.data.result
    tableDataList.value.forEach((item: RolePermissionsInfoType) => {
      item.selected = false
    })
  }
}
</script>

<template>
  <ContentWrap class="min-h-[var(--view-context-height)] pl-150px pr-150px">
    <BaseButton class="pos-absolute left-40px top-40px" @click="go(-1)"> 返回 </BaseButton>
    <div class="min-h-[calc(var(--view-context-height)-94px)]">
      <div class="text-align-center font-bold">
        {{ isAdd ? '新增权限' : '编辑权限' }}
      </div>
      <div class="font-bold ml-10px mt-30px mb-30px">权限信息</div>
      <Form :schema="schema" :rules="rules" @register="formRegister" />
      <div class="font-bold ml-10px mt-30px mb-30px">系统权限</div>
      <Table :columns="columns" :data="tableDataList" />
    </div>
    <div class="mt-30px h-[52px] pt-20px border-t-1px border-t-solid border-t-[#409eff]">
      <BaseButton type="primary" @click="saveAction">保存</BaseButton>
      <BaseButton @click="closeAction">关闭</BaseButton>
    </div>
    <LookStaffDialog v-model:model-value="showAllUsersDialog" :data-list="allUsers" @save="save" />
    <Dialog v-model="showImportResultDialog" title="导入人员名单" width="600" :max-height="300">
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
        <BaseButton @click="showImportResultDialog = false">取消</BaseButton>
      </template>
    </Dialog>
  </ContentWrap>
</template>
