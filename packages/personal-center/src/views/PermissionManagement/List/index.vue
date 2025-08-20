<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { getRoleListApi, deleteRoleApi } from '@/api/permission/index'
import type { RoleItemType } from '@/api/permission/types'
import type { UserInfoType } from '@/api/common/types'
import { ElMessage, ElTag } from 'element-plus'
import { formatTime } from '@/utils/index'
import { useRouter } from 'vue-router'

const { push } = useRouter()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getRoleListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
    })
    res.data.result?.forEach((item: RoleItemType) => {
      item.updated_at = formatTime(item.updated_at, 'yyyy/MM/dd HH:mm:ss')
    })
    return {
      list: res.data?.result ?? [],
      total: res.data?.pagination?.total ?? 0
    }
  },
  fetchDelApi: async () => {
    if (!currentRow.value?.id) {
      ElMessage.error('删除失败')
      return false
    }
    const res = await deleteRoleApi({ id: currentRow.value?.id })
    return res.code === 200
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
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
    field: 'name',
    label: '角色',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入角色名称查询',
        style: {
          width: '200px'
        }
      }
    }
  },
  {
    field: 'role_users_info',
    label: '关联用户',
    slots: {
      default: (data: any) => {
        const row = data.row as RoleItemType
        const users =
          row.role_users_info?.length > 10
            ? row.role_users_info?.slice(0, 10)
            : row.role_users_info || []
        return (
          <>
            {users.map((item: UserInfoType) => {
              return (
                <ElTag class="ml-5px" type="success">
                  {item.name}
                </ElTag>
              )
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
      width: 240,
      slots: {
        default: (data: any) => {
          const row = data.row as RoleItemType
          return (
            <>
              <BaseButton type="primary" onClick={() => editAction(row)}>
                编辑
              </BaseButton>
              <BaseButton
                loading={unref(delLoading)}
                type="danger"
                onClick={() => deleteAction(row)}
              >
                删除
              </BaseButton>
            </>
          )
        }
      }
    }
  }
])
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const searchParams = ref({})
const currentRow = ref<RoleItemType>()
const delLoading = ref(false)

const searchAction = (params: any) => {
  searchParams.value = {
    name: params.name,
    user_name: params.role_users_info
  }
  getList()
}

const addAction = () => {
  push('/permission-management/add')
}

const editAction = (row: RoleItemType) => {
  push({
    path: '/permission-management/edit',
    query: {
      id: row.id
    }
  })
}

const deleteAction = async (row: RoleItemType) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}
</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="searchAction" @reset="searchAction" />
    <div class="mb-10px">
      <BaseButton type="primary" @click="addAction">新增</BaseButton>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      @register="tableRegister"
    />
  </ContentWrap>
</template>

<style lang="less" scoped>
:deep(.el-form-item__label-wrap) {
  margin-left: 0 !important;
}
</style>
