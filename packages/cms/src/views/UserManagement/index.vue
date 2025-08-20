<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table } from '@/components/Table'
import { ref, unref, reactive } from 'vue'
import {
  getUserListApi,
  userUpdateApi,
  checkUserExistApi,
  addUserApi,
  getFileTemplateApi
} from '@/api/login/index'
import type { UserType } from '@/api/login/types'
import { useTable } from '@/hooks/web/useTable'
import { Search } from '@/components/Search'
import AddDialog from './components/AddDialog.vue'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { ElMessage, ElMessageBox, ElUpload, type UploadRequestOptions } from 'element-plus'
import * as XLSX from 'xlsx'
import { Dialog } from '@/components/Dialog/index'
import { formatTime } from '@/utils/index'
import { Permission } from '@/components/Permission'

const currentRow = ref<UserType>()
const addDialogRef = ref<ComponentRef<typeof AddDialog>>()
const addDialogType = ref<'add' | 'edit'>('add')
const searchParams = ref<{ name: string }>({ name: '' })
const showBatchImportDialog = ref(false)
const batchImportResult = ref<any[]>([])
const failImportResult = ref<any[]>([])
const importLoading = ref(false)

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { pageSize, currentPage } = tableState
    const res = await getUserListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      search: unref(searchParams)?.name
    })
    return {
      list: res.data.list || [],
      total: res.data.pagination.total || 0
    }
  }
})
const { total, loading, dataList, pageSize, currentPage } = tableState
const { getList } = tableMethods

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
          const row = data.row as UserType
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
    field: 'status',
    label: '状态',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as UserType
          return (
            <>
              <div class={row.status === 1 ? 'text-green-500' : 'text-red-500'}>
                {row.status === 1 ? '在职' : '离职'}
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
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as UserType
          return <>{formatTime(row.updated_at, 'yyyy-MM-dd HH:mm:ss')}</>
        }
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    search: {
      hidden: true
    },
    table: {
      width: 240,
      slots: {
        default: (data: any) => {
          const row = data.row as UserType
          return (
            <>
              <Permission permission="PUT">
                <BaseButton
                  type="primary"
                  disabled={row.status === 2}
                  onClick={() => editAction(row)}
                >
                  编辑
                </BaseButton>
              </Permission>
              {row.status === 1 && (
                <Permission permission="PUT">
                  <BaseButton type="danger" onClick={() => resignAction(row)}>
                    离职
                  </BaseButton>
                </Permission>
              )}
            </>
          )
        }
      }
    }
  }
])
const { allSchemas } = useCrudSchemas(crudSchemas)

const searchAction = (params: any) => {
  currentPage.value = 1
  searchParams.value = params
  getList()
}

const addAction = () => {
  addDialogType.value = 'add'
  addDialogRef.value?.open()
}

const downloadTemplate = async () => {
  const res = await getFileTemplateApi({ type: 1 })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = '用户导入模板.xlsx' // 设置下载后的文件名以及扩展名，按需修改
  a.click()
  URL.revokeObjectURL(url) // 释放临时URL
}

const editAction = (row: UserType) => {
  currentRow.value = row
  addDialogType.value = 'edit'
  addDialogRef.value?.open()
}

const resignAction = async (row: UserType) => {
  ElMessageBox.confirm('是否将该员工离职？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await userUpdateApi({ id: row.id, status: 2 })
    if (res.code === 200) {
      ElMessage.success('已将该用户成功离职')
      getList()
    } else {
      ElMessage.error('离职失败')
    }
  })
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
          const userInfos = jsonData.filter(
            (item: any) =>
              item &&
              item !== 'undefined' &&
              (item[0] || item[1] || item[2] || item[3] || item[4] || item[5] || item[6] || item[7])
          )
          const newUserInfos = [...new Set(userInfos)]
          if (newUserInfos.length === 0 || newUserInfos.find((item: any) => !item[1] || !item[5])) {
            ElMessage.error('请检查表格必填项是否填写')
            reject(Error('表格不完整，请检查后重新提交'))
            return
          }
          checkUserExist(newUserInfos)
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

const checkUserExist = async (users: any[]) => {
  const emails = users.map((user) => user[5])
  const res = await checkUserExistApi({ emails: emails as string[] })
  if (res.code === 200) {
    showBatchImportDialog.value = true
    batchImportResult.value = users
    failImportResult.value =
      res.data?.exits?.map((item) => ({
        ...item,
        error_type: 1,
        error_msg: '用户邮箱已存在'
      })) ?? []
    const availableImport = batchImportResult.value.filter(
      (bItem) => !failImportResult.value.find((fItem) => bItem[5] === fItem.email)
    )
    const invalidEmailUsers = availableImport.filter(
      (item) => !/^[a-zA-Z0-9_.+-]+@yidatec\.com$/.test(item[5])
    )
    failImportResult.value = [
      ...failImportResult.value,
      ...invalidEmailUsers.map((item) => ({
        email: item[5],
        error_type: 2,
        error_msg: '用户邮箱格式错误'
      }))
    ]
  } else {
    ElMessage.error('检查用户是否存在失败')
  }
}

const submitImport = async () => {
  importLoading.value = true
  const availableImport = batchImportResult.value.filter(
    (bItem) => !failImportResult.value.find((fItem) => bItem[5] === fItem.email)
  )
  const availableUsers = availableImport.map((item) => ({
    number: item[0]?.toString(),
    name: item[1],
    sex: item[2],
    directorate: item[3],
    level: item[4]?.toString(),
    email: item[5],
    address: item[6],
    mobile: item[7]?.toString()
  }))
  const res = await addUserApi({
    users: availableUsers
  })
  importLoading.value = false
  if (res.code === 200) {
    ElMessage.success('批量导入成功')
    getList()
  } else {
    ElMessage.error('批量导入失败')
  }
  showBatchImportDialog.value = false
}
</script>

<template>
  <div class="flex w-100% h-100%">
    <ContentWrap class="flex-[3]">
      <Search :schema="allSchemas.searchSchema" @reset="searchAction" @search="searchAction" />
      <div class="mb-10px flex">
        <Permission permission="POST">
          <BaseButton class="mr-10px" type="primary" @click="addAction">新增</BaseButton>
        </Permission>
        <ElUpload
          action="#"
          :show-file-list="false"
          :http-request="uploadFile"
          :before-upload="beforeAvatarUpload"
          :on-exceed="handleExceedOne"
        >
          <Permission permission="POST">
            <BaseButton type="primary">批量导入用户</BaseButton>
          </Permission>
        </ElUpload>
        <Permission permission="POST">
          <BaseButton class="ml-a mr-0" type="primary" @click="downloadTemplate"
            >模版下载</BaseButton
          >
        </Permission>
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
    <AddDialog
      :type="addDialogType"
      :current-row="currentRow"
      @update-list="getList"
      ref="addDialogRef"
      @closed="currentRow = undefined"
    />
    <Dialog v-model="showBatchImportDialog" title="批量导入用户" width="600" :max-height="300">
      <div class="px-15px">
        <span>{{
          `共${batchImportResult.length}条数据，预计成功导入${batchImportResult.length - failImportResult.length}条数据`
        }}</span>
        <span v-if="failImportResult.length">，</span>
        <span class="text-red" v-if="failImportResult.length">{{
          `失败${failImportResult.length}条数据`
        }}</span>
      </div>
      <div class="text-red mt-10px mb-10px font-700 px-15px" v-if="failImportResult.length">
        导入失败数据：
      </div>
      <div class="px-15px" v-if="failImportResult.length">
        <div class="text-red" v-for="item in failImportResult" :key="item.email">
          <span class="mr-20px">{{ item.email }}</span>
          <span>{{ item.error_msg }}</span>
        </div>
      </div>
      <template #footer>
        <BaseButton
          type="primary"
          @click="submitImport"
          :loading="importLoading"
          :disabled="batchImportResult.length - failImportResult.length < 1"
          >确认导入</BaseButton
        >
        <BaseButton @click="showBatchImportDialog = false">取消</BaseButton>
      </template>
    </Dialog>
  </div>
</template>
