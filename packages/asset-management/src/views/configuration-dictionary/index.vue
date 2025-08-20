<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { ContentWrap } from '@/components/ContentWrap'
import { dataConfigurationDictionaryPage } from '@/api/configuration-dictionary'
import { Table, type TableColumn } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { formatTime } from '@/utils/index'
import { find } from 'lodash-es'
import { ElTag } from 'element-plus'
import { useHandleSaveClick, useHandleDeleteClick } from '@/ops/op-configuration-dictionary'
import { Permission } from '@/components/Permission'

const categoryType = [
  {
    value: 1,
    label: '固定资产',
    type: 'success'
  },
  {
    value: 2,
    label: '消耗品',
    type: 'info'
  }
]

const columns: TableColumn[] = [
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'category',
    label: '物品类别',
    slots: {
      default: ({ row }: { row: { category: number } }) => {
        const item = find(categoryType, { value: row.category })

        return (
          <ElTag type={item?.type as 'success' | 'info' | 'warning' | 'primary' | 'danger'}>
            {item?.label}
          </ElTag>
        )
      }
    }
  },
  {
    field: 'type',
    label: '物品类型'
  },
  {
    field: 'created_at',
    label: '创建时间',
    slots: {
      default: ({ row }: { row: { created_at: string } }) => {
        return <>{formatTime(row.created_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'creator_name',
    label: '创建人'
  },
  {
    field: 'action',
    label: '操作',
    slots: {
      default: (data) => {
        return (
          <>
            <Permission permission="PUT">
              <BaseButton type="primary" onClick={() => handleSaveClick(data.row)}>
                编辑
              </BaseButton>
            </Permission>
            <Permission permission="DELETE">
              <BaseButton type="danger" onClick={() => handleDeleteClick(data.row)}>
                删除
              </BaseButton>
            </Permission>
          </>
        )
      }
    }
  }
]

const searchParams = ref({})

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await dataConfigurationDictionaryPage({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
    })

    return {
      list: res.data.Items || [],
      total: res.data.pagination.total
    }
  }
})
const { refresh, getList } = tableMethods

const handleSaveClick = useHandleSaveClick(refresh)

const handleDeleteClick = useHandleDeleteClick(refresh)

const { loading, dataList, total, currentPage, pageSize } = tableState

const schema = reactive<FormSchema[]>([
  {
    field: 'type',
    label: '',
    component: 'Input'
  }
])

const handleSearch = (data: any) => {
  searchParams.value = data
  getList()
}
const handleResetClick = () => {
  searchParams.value = {}
  refresh()
}
</script>

<template>
  <ContentWrap>
    <div class="flex justify-between">
      <Permission permission="POST">
        <BaseButton type="primary" @click="handleSaveClick">新增</BaseButton>
      </Permission>
      <Search
        :schema="schema"
        buttonPosition="right"
        @search="handleSearch"
        @reset="handleResetClick"
      />
    </div>

    <Table
      :columns="columns"
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :data="dataList"
      :pagination="{
        total: total
      }"
      @tableRegister="tableRegister"
      :loading="loading"
    />
  </ContentWrap>
</template>
