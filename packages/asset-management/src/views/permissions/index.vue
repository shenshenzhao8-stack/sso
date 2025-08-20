<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { useTable } from '@/hooks/web/useTable'
import { Table, type TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { dataPermissionsPage } from '@/api/permissions'
import { formatTime } from '@/utils/index'
import { ElTag } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Permission } from '@/components/Permission'
import {
  useHandleCreateClick,
  useHandleEditClick,
  useHandleDeleteClick
} from '@/ops/op-permissions'

const searchParams = ref({})
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await dataPermissionsPage({
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

const { getList, refresh } = tableMethods

const handleEditClick = useHandleEditClick(refresh)
const handleDeleteClick = useHandleDeleteClick(refresh)

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
      default: ({ row }: any) => {
        return (
          <>
            <Permission permission="PUT">
              <BaseButton type="primary" onClick={() => handleEditClick(row.id)}>
                编辑
              </BaseButton>
            </Permission>
            <Permission permission="DELETE">
              <BaseButton type="danger" onClick={() => handleDeleteClick(row.id)}>
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
const setSearchParams = (data: any) => {
  searchParams.value = data
  getList()
}

const handleCreateClick = useHandleCreateClick(refresh)
</script>

<template>
  <ContentWrap>
    <div class="flex justify-between">
      <Permission permission="POST">
        <BaseButton type="primary" @click="handleCreateClick">新增</BaseButton>
      </Permission>

      <Search :schema="searchSchema" @reset="setSearchParams" @search="setSearchParams" />
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
</template>
