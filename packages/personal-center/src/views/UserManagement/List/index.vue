<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { ElMessage, ElMessageBox, ElUpload, type UploadRequestOptions } from 'element-plus'
import { Dialog } from '@/components/Dialog/index'
import { getFileTemplateApi, checkUserExistApi } from '@/api/common/index'
import {
  getUserListApi,
  managerResetUserPasswordApi,
  insertUserApi,
  deleteUserApi
} from '@/api/user/index'
import type { UserInfoType } from '@/api/common/types'
import { formatTime } from '@/utils/index'
import * as XLSX from 'xlsx'
import { useRouter } from 'vue-router'

const { push } = useRouter()

// 导入的总数据
const allImportUser = ref<any[]>([])
// 导入正常数据
const successImportUser = ref<any[]>([])
// 导入异常数据
const errorImportUser = ref<any[]>([])
const showImportResultDialog = ref(false)

const currentRow = ref<UserInfoType>()
const delLoading = ref(false)
const searchParams = ref()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { pageSize, currentPage } = tableState
    const res = await getUserListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      search: unref(searchParams)
    })
    res.data.list?.forEach((item: UserInfoType) => {
      item.updated_at = formatTime(item.updated_at ?? 0, 'yyyy/MM/dd HH:mm:ss')
      item.created_at = formatTime(item.created_at ?? 0, 'yyyy/MM/dd HH:mm:ss')
    })
    return {
      list: res.data.list || [],
      total: res.data.pagination.total || 0
    }
  },
  fetchDelApi: async () => {
    if (!currentRow.value?.id) {
      ElMessage.error('删除失败')
      return false
    }
    const res = await deleteUserApi({ id: currentRow.value?.id })
    return res.code === 200
  }
})
const { total, loading, dataList, pageSize, currentPage } = tableState
const { getList, delList } = tableMethods

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: '序号',
    search: {
      hidden: true
    },
    table: {
      type: 'index'
    }
  },
  {
    field: 'email',
    label: '邮箱',
    search: {
      hidden: true
    }
  },
  {
    field: 'number',
    label: '工号',
    search: {
      hidden: true
    }
  },
  {
    field: 'name',
    label: '用户名',
    search: {
      label: ' ',
      componentProps: {
        placeholder: '请输入邮箱或用户名查询',
        style: {
          width: '200px'
        }
      }
    }
  },
  {
    field: 'sex',
    label: '性别',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as UserInfoType
          if (row.sex === 0) return <div class="text-gray-500">未知</div>
          return (
            <div class={row.sex === 1 ? 'text-blue-500' : 'text-pink-500'}>
              {row.sex === 1 ? '男' : '女'}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'position',
    label: '岗位',
    search: {
      hidden: true
    }
  },
  {
    field: 'department_info',
    label: '部门',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as UserInfoType
          return (
            <>{`${row.department_info?.name ?? '-'}（${row.department_info?.head_user_info?.name ?? '-'}）`}</>
          )
        }
      }
    }
  },
  {
    field: 'project_info.name',
    label: '所在项目',
    search: {
      hidden: true
    }
  },
  {
    field: 'contract_info.name',
    label: '合同归属',
    search: {
      hidden: true
    }
  },
  {
    field: 'status',
    label: '状态',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as UserInfoType
          return (
            <>
              <div class={row.status === 1 ? 'text-green-500' : 'text-red-500'}>
                {getStatusText(row.status ?? -1)}
              </div>
            </>
          )
        }
      }
    }
  },
  {
    field: 'updated_at',
    label: '更新时间',
    search: {
      hidden: true
    }
  },
  {
    field: 'created_at',
    label: '创建时间',
    search: {
      hidden: true
    }
  },
  {
    field: 'remark',
    label: '备注',
    search: {
      hidden: true
    }
  },
  {
    field: 'action',
    label: '操作',
    search: {
      hidden: true
    },
    table: {
      width: 260,
      slots: {
        default: (data: any) => {
          const row = data.row as UserInfoType
          return (
            <>
              <BaseButton
                type="primary"
                disabled={row.status === 2}
                onClick={() => editAction(row)}
              >
                编辑
              </BaseButton>
              <BaseButton
                type="primary"
                disabled={row.status === 2}
                onClick={() => resetPasswordAction(row)}
              >
                重置密码
              </BaseButton>
              <BaseButton type="danger" onClick={() => deleteUser(row)}>
                删除
              </BaseButton>
            </>
          )
        }
      }
    }
  }
])
const { allSchemas } = useCrudSchemas(crudSchemas)

const getStatusText = (status: number) => {
  if (status === 1) {
    return '在职'
  } else if (status === 2) {
    return '离职'
  } else if (status === 3) {
    return '离项中'
  } else if (status === 4) {
    return '待岗中'
  }
  return '-'
}

const searchAction = (params: any) => {
  searchParams.value = params.name
  getList()
}

const addAction = () => {
  push('/user-management/add')
}

const beforeAvatarUpload = (file: any) => {
  const excelist = ['xls', 'xlsx']
  const list = file.name.split('.')
  if (!excelist.includes(list[list.length - 1])) {
    ElMessage.error('只支持xls、xlsx格式')
    return false
  }
  return true
}

const handleExceedOne = () => {
  ElMessage.warning('最多可上传一个文件!')
}

const uploadFile = (params: UploadRequestOptions): Promise<void> => {
  const { file } = params
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = async function (e: any) {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 1 })
          let userInfos = jsonData.filter((item: any) => item && item !== 'undefined' && item[0])
          userInfos = userInfos.filter((item: any) => {
            return item.some((sub_item: any, index: number) => {
              return index < 10 && sub_item?.toString().trim().length
            })
          })
          const newUserInfos = [...new Set(userInfos)]
          const users = getAllImportUsers(newUserInfos) ?? []
          const emails = users.map((user) => user.email)
          const res = await checkUserExistApi({ emails: emails as string[] })
          if (res.code === 200) {
            showImportResultDialog.value = true
            allImportUser.value = users
            errorImportUser.value =
              res.data?.exits?.map((item) => ({
                ...item,
                error_msg: '用户已存在'
              })) ?? []
            const availableImportUser = allImportUser.value.filter(
              (aItem) => !errorImportUser.value.find((eItem) => eItem.email === aItem.email)
            )
            const invalidEmailUsers = availableImportUser.filter(
              (item) => !/^[a-zA-Z0-9_.+-]+@yidatec\.com$/.test(item.email)
            )
            errorImportUser.value = [
              ...errorImportUser.value,
              ...invalidEmailUsers.map((item) => ({
                ...item,
                error_msg: '用户邮箱格式错误'
              }))
            ]
            successImportUser.value = allImportUser.value.filter(
              (aItem) => !errorImportUser.value.find((eItem) => eItem.email === aItem.email)
            )
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

const getAllImportUsers = (users: any[]) => {
  if (!users.length) {
    ElMessage.error('表格中没有有效的用户')
    return
  }
  const userItems: any[] = []
  for (let i = 0; i < users.length; i++) {
    const user = users[i]

    if (!user[0]?.toString().length) {
      ElMessage.error('表格中有邮箱未填写')
      return
    }
    if (user[0].toString().length > 30) {
      ElMessage.error('邮箱长度在30个字符以内')
      return
    }
    user[0] = user[0].toString()

    if (!user[1]?.toString().length) {
      ElMessage.error('表格中有工号未填写')
      return
    }
    if (user[1].toString().length > 20) {
      ElMessage.error('工号长度在20个字符以内')
      return
    }
    user[1] = user[1].toString()

    if (!user[2]?.toString().length) {
      ElMessage.error('表格中有姓名未填写')
      return
    }
    if (user[2].toString().length > 20) {
      ElMessage.error('姓名长度在20个字符以内')
      return
    }
    user[2] = user[2].toString()

    if (!user[3]?.toString().length) {
      ElMessage.error('表格中有性别未选择')
      return
    }
    user[3] = user[3].toString() === '男' ? 1 : 2

    if (!user[4]?.toString().length) {
      ElMessage.error('表格中有岗位未填写')
      return
    }
    if (user[4].toString().length > 30) {
      ElMessage.error('岗位长度在30个字符以内')
      return
    }
    user[4] = user[4].toString()

    // if (!user[5]?.toString().length) {
    //   ElMessage.error('表格中有部门未填写')
    //   return
    // }
    user[5] = user[5]?.toString()

    if (!user[6]?.toString().length) {
      ElMessage.error('表格中有所在项目未填写')
      return
    }
    user[6] = user[6].toString()

    if (!user[7]?.toString().length) {
      ElMessage.error('表格中有合同归属未填写')
      return
    }
    user[7] = user[7].toString()

    if (!user[8]?.toString().length) {
      ElMessage.error('表格中有在职状态未选择')
      return
    }
    if (user[8].toString() === '在职') {
      user[8] = 1
    } else if (user[8].toString() === '离职') {
      user[8] = 2
    } else if (user[8].toString() === '离项中') {
      user[8] = 3
    } else if (user[8].toString() === '待岗中') {
      user[8] = 4
    } else {
      ElMessage.error('表格中有在职状态填写错误的项')
      return
    }

    if (user[9]?.toString().length > 200) {
      ElMessage.error('备注长度在200个字符以内')
      return
    }

    userItems.push({
      email: user[0],
      number: user[1],
      name: user[2],
      sex: user[3],
      position: user[4],
      department: user[5],
      project: user[6],
      contract_company: user[7],
      status: user[8],
      remark: user[9]?.toString() ?? ''
    })
  }
  return userItems
}

const downloadTemplate = async () => {
  const res = await getFileTemplateApi({ type: 1 })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = '用户导入模板.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

const editAction = (row: UserInfoType) => {
  currentRow.value = row
  push({
    path: '/user-management/edit',
    query: {
      id: row.id
    }
  })
}

const resetPasswordAction = (row: UserInfoType) => {
  ElMessageBox.confirm('确定重置该用户的密码？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await managerResetUserPasswordApi({ id: row.id })
    if (res.code === 200) {
      ElMessage.success('重置密码成功')
    } else {
      ElMessage.error('重置密码失败')
    }
  })
}

const deleteUser = async (row: UserInfoType) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}

const submitImport = async () => {
  if (successImportUser.value.length) {
    const res = await insertUserApi({ users: successImportUser.value })
    if (res.code === 200) {
      ElMessage.success('导入成功')
      showImportResultDialog.value = false
      getList()
    } else {
      ElMessage.error(res.msg ?? '导入失败')
    }
  }
}
</script>

<template>
  <div class="flex w-100% h-100%">
    <ContentWrap class="flex-[3]">
      <Search :schema="allSchemas.searchSchema" @reset="searchAction" @search="searchAction" />
      <div class="mb-10px flex">
        <BaseButton class="mr-10px" type="primary" @click="addAction">新增</BaseButton>
        <ElUpload
          action="#"
          :show-file-list="false"
          :http-request="uploadFile"
          :before-upload="beforeAvatarUpload"
          :on-exceed="handleExceedOne"
        >
          <BaseButton type="primary">批量导入用户</BaseButton>
        </ElUpload>
        <BaseButton class="ml-a mr-0" type="primary" @click="downloadTemplate">模版下载</BaseButton>
      </div>
      <Table
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :columns="allSchemas.tableColumns"
        :data="dataList"
        :loading="loading"
        @register="tableRegister"
        :pagination="{
          total
        }"
      />
    </ContentWrap>
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
  </div>
</template>
