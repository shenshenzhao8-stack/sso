<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { getRoleListApi, createRole, updateRole, deleteRole, roleDetail } from '@/api/role'
import { useTable } from '@/hooks/web/useTable'
import { Table, type TableColumn } from '@/components/Table'
import { ElTag, ElDrawer, ElMessage, ElMessageBox, ElScrollbar } from 'element-plus'
import type { AddRoleDto } from '@/api/role/type'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { ContentWrap } from '@/components/ContentWrap'
import Write from './components/Write.vue'
import { BaseButton } from '@/components/Button'
import { Permission } from '@/components/Permission'
import { formatTime } from '@/utils/index'

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getRoleListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...searchParams.value
    })
    return {
      list: res.data.items || [],
      total: res.data.pagination.total
    }
  }
})

const { dataList, loading, total, pageSize, currentPage } = tableState
const { getList } = tableMethods

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'role_name',
    label: '角色名称'
  },
  {
    field: 'status',
    label: '关联用户',
    slots: {
      default: (data: any) => {
        const users =
          data.row?.users?.length > 10 ? data.row?.users?.slice(0, 10) : data.row.users || []
        return (
          <>
            {users.map((item: any) => {
              return <ElTag type="success">{item.name}</ElTag>
            })}
            {data.row?.users?.length > 10 ? <div>...</div> : <div></div>}
          </>
        )
      }
    }
  },
  {
    field: 'updated_at',
    label: '更新时间',
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.updated_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    width: 240,
    slots: {
      default: (data: any) => {
        const row = data.row
        return (
          <>
            <Permission permission="PUT">
              <BaseButton type="primary" onClick={() => action(row, 'edit')}>
                编辑
              </BaseButton>
            </Permission>
            <Permission permission="DELETE">
              <BaseButton
                type="danger"
                onClick={() => {
                  ElMessageBox.confirm('确定删除该角色？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }).then(async () => {
                    deleteRole(row.id).then((res: any) => {
                      if (res.code === 200) {
                        ElMessage.success('删除成功')
                        getList()
                      } else {
                        ElMessage.error(res.msg)
                      }
                    })
                  })
                }}
              >
                删除
              </BaseButton>
            </Permission>
          </>
        )
      }
    }
  }
])

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'role_name',
    label: '角色名称',
    component: 'Input'
  }
])

const searchParams = ref({})
const setSearchParams = (data: any) => {
  searchParams.value = data
  getList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref()
const actionType = ref('')

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const action = async (row: any, type: string) => {
  dialogTitle.value = type === 'edit' ? '编辑' : '详情'
  const { data } = await roleDetail(row.id)
  actionType.value = type
  currentRow.value = data
  dialogVisible.value = true
}

const AddAction = () => {
  dialogTitle.value = '新增'
  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = ''
}

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    let promise: Promise<any> = Promise.resolve()
    if (actionType.value == 'edit') {
      promise = updateRole(formData as AddRoleDto)
    } else {
      promise = createRole(formData as AddRoleDto)
    }
    promise
      .then((res) => {
        if (res.code === 200) {
          ElMessage.success(dialogTitle.value + '成功')
          dialogVisible.value = false
          getList()
        } else if (res.code == 200001 || res.code == 500201) {
          ElMessage.error('角色名称已存在')
        } else {
          ElMessage.error(res.msg)
        }
      })
      .finally(() => {
        saveLoading.value = false
      })
  }
}

const drawerBeforeClose = (done: (cancel?: boolean) => void) => {
  ElMessageBox.confirm('取消后修改内容会丢失，确定关闭？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (done) done(false)
      saveLoading.value = false
      dialogVisible.value = false
    })
    .catch(() => {
      if (done) done(true)
    })
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @reset="setSearchParams" @search="setSearchParams" />
    <div class="mb-10px">
      <Permission permission="POST">
        <BaseButton type="primary" @click="AddAction">新增</BaseButton>
      </Permission>
    </div>
    <Table
      :show-overflow-tooltip="false"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :columns="tableColumns"
      default-expand-all
      node-key="id"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total
      }"
      @register="tableRegister"
    />
  </ContentWrap>

  <ElDrawer
    v-model="dialogVisible"
    :title="dialogTitle"
    size="50vw"
    :before-close="drawerBeforeClose"
  >
    <ElScrollbar style="min-width: 660px">
      <Write v-if="dialogVisible" ref="writeRef" :current-row="currentRow" />
    </ElScrollbar>
    <template #footer>
      <BaseButton type="primary" :loading="saveLoading" @click="save"> 保存 </BaseButton>
      <BaseButton @click="drawerBeforeClose">关闭</BaseButton>
    </template>
  </ElDrawer>
</template>
