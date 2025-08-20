<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, type TableColumn } from '@/components/Table'
import { ref, unref } from 'vue'
import { BaseButton } from '@/components/Button'
import { useTable } from '@/hooks/web/useTable'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { reactive } from 'vue'
import { dataAssetsConsumablesPage } from '@/api/assets-consumables'
import { dataConfigurationDictionaryList } from '@/api/configuration-dictionary'
import { find } from 'lodash-es'
import { ASSETS_CONSUMABLES_TYPE } from '@/const'
import { formatTime } from '@/utils/index'
import { useRouter } from 'vue-router'
import { ElTag, ElImage } from 'element-plus'
import { useHandleEnterClick, useHandleOutClick } from '@/ops/op-assets-consumables'
import { Permission } from '@/components/Permission'
import { isArray } from 'lodash-es'
import { useHandleDeleteClick } from '@/ops/op-assets-consumables'

const { push } = useRouter()

const handleDetailClick = (row: any) => {
  push({
    path: `/assets/${row.id}/consumables-detail`,
    query: {
      op: 'detail'
    }
  })
}

const handleEditClick = (row: any) => {
  push(`/assets/${row.id}/consumables-detail`)
}

const columns: TableColumn[] = [
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'img_url',
    label: '物品图片',
    minWidth: 80,
    slots: {
      default: ({ row }) => {
        return (
          <div
            class="h-40px"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <ElImage
              src={row.img_url}
              fit="cover"
              lazy
              preview-src-list={[row.img_url]}
              preview-teleported
            />
          </div>
        )
      }
    }
  },
  {
    field: 'no',
    label: '物品 ID',
    minWidth: 150
  },
  {
    field: 'name',
    label: '物品名称',
    minWidth: 100
  },
  {
    field: 'type_name',
    label: '物品类型',
    minWidth: 100
  },
  {
    field: 'stock_num',
    label: '状态',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        const statusItem = find(ASSETS_CONSUMABLES_TYPE, { value: row.stock_num > 0 ? 1 : 2 })

        return <ElTag type={statusItem?.type as any}>{statusItem?.label}</ElTag>
      }
    }
  },
  {
    field: 'price',
    label: '单价',
    minWidth: 100
  },
  {
    field: 'unit',
    label: '单位',
    minWidth: 100
  },
  {
    field: 'stock_num',
    label: '库存',
    minWidth: 100
  },
  {
    field: 'brand',
    label: '品牌/规格',
    minWidth: 200
  },
  {
    field: 'display_time',
    label: '更新时间',
    sortable: true,
    minWidth: 120,
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
    minWidth: 320,
    slots: {
      default: (data) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Permission permission="DELETE">
              <BaseButton plain type="danger" onClick={() => handleDelClick(data.row.id)}>
                删除
              </BaseButton>
            </Permission>
            <Permission permission="PUT">
              <BaseButton onClick={() => handleEditClick(data.row)}>编辑</BaseButton>
              <BaseButton onClick={() => handleOutClick(data.row.id)}>出库</BaseButton>
              <BaseButton onClick={() => handleEnterClick(data.row.id)}>入库</BaseButton>
            </Permission>
          </div>
        )
      }
    }
  }
]

const schema = reactive<FormSchema[]>([
  {
    field: 'type',
    label: '',
    component: 'Select',
    optionApi: async () => {
      const res = await dataConfigurationDictionaryList({ category: 2, with_del: true })
      const arr = isArray(res.data) ? res.data : []
      return arr.map((v: any) => ({
        label: v.type,
        value: v.id
      }))
    },
    componentProps: {
      placeholder: '请选择物品类型',
      multiple: true
    }
  },
  {
    field: 'status',
    label: '',
    component: 'Select',
    componentProps: {
      options: ASSETS_CONSUMABLES_TYPE,
      placeholder: '请选择状态',
      multiple: true
    }
  },
  {
    field: 'name',
    label: '',
    component: 'Input',
    componentProps: {
      placeholder: '请输入物品名称查询'
    }
  }
])

const searchParams = ref({})

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await dataAssetsConsumablesPage({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
    })

    return {
      list: res.data.items || [],
      total: res.data.pagination.total
    }
  }
})
const { refresh, getList } = tableMethods

const handleDelClick = useHandleDeleteClick(refresh)

const { loading, dataList, total, currentPage, pageSize } = tableState

const handleEnterClick = useHandleEnterClick(refresh)
const handleOutClick = useHandleOutClick(refresh)

const handleSearch = (data: any) => {
  searchParams.value = data
  getList()
}

const handleAddClick = () => {
  push('/assets/consumables-add')
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
        <BaseButton @click="handleAddClick">新增</BaseButton>
      </Permission>
      <Search
        :schema="schema"
        buttonPosition="right"
        @search="handleSearch"
        @reset="handleResetClick"
      />
    </div>

    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="columns"
      :data="dataList"
      :loading="loading"
      @register="tableRegister"
      :pagination="{
        total: total
      }"
      @rowClick="handleDetailClick"
      :row-style="
        () => {
          return {
            cursor: 'pointer'
          }
        }
      "
    />
  </ContentWrap>
</template>
