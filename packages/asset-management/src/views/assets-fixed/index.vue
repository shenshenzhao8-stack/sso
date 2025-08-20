<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Table, type TableColumn } from '@/components/Table'
import { ref, unref } from 'vue'
import { BaseButton } from '@/components/Button'
import { useTable } from '@/hooks/web/useTable'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { dataAssetsFixedPage } from '@/api/assets-fixed'
import { dataConfigurationDictionaryList } from '@/api/configuration-dictionary'
import { find } from 'lodash-es'
import { handleDeprecatedClick, handleRevertClick, handleUseClick } from '@/ops/op-assets-fixed'
import { ElImage, ElTag } from 'element-plus'
import { formatTime } from '@/utils/index'
import { ASSETS_STATUS } from '@/const'
import { Permission } from '@/components/Permission'
import { useHandleDeleteClick } from '@/ops/op-assets-fixed'
import { isArray } from 'lodash-es'

const { push } = useRouter()

const handleEditClick = (row: any) => {
  push(`/assets/${row.id}/detail`)
}

const statusType = [
  {
    label: '闲置',
    value: 1,
    color: '#67C23A'
  },
  {
    label: '占用',
    value: 2,
    color: '#E6A23C'
  },
  {
    label: '报废',
    value: 3,
    color: '#F56C6C'
  }
]
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
    minWidth: 100
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
    field: 'status',
    label: '状态',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        const statusItem = find(ASSETS_STATUS, { value: row.status })
        return (
          <>
            <ElTag type={statusItem?.type as any}>{statusItem?.label}</ElTag>
          </>
        )
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
    field: 'brand',
    label: '品牌/规格',
    minWidth: 100
  },
  {
    field: 'user.name',
    label: '当前使用人',
    minWidth: 100
  },
  {
    field: 'user.id',
    label: '当前使用人工号',
    minWidth: 140,
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{row.user?.id ? row.user?.id : ''}</>
      }
    }
  },
  {
    field: 'user.contract',
    label: '合同归属',
    minWidth: 100
  },
  {
    field: 'updated_at',
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
    minWidth: 380,
    slots: {
      default: (data) => {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Permission permission="POST">
              <BaseButton type="success" onClick={(e) => handleEditClick(data.row)}>
                编辑
              </BaseButton>
            </Permission>
            <Permission permission="DELETE">
              <BaseButton
                plain
                type="danger"
                onClick={() => handleDeleteClick(data.row)}
                disabled={data.row.status === 2}
              >
                删除
              </BaseButton>
            </Permission>
            <Permission permission="PUT">
              <BaseButton
                type="info"
                onClick={() => handleDeprecatedClick(data.row, refresh)}
                disabled={data.row.status == 3 || data.row.status === 2}
              >
                报废
              </BaseButton>
              <BaseButton
                type="warning"
                onClick={() => handleUseClick(data.row.id, refresh)}
                disabled={data.row.status == 3}
              >
                领用
              </BaseButton>
              <BaseButton
                type="danger"
                onClick={() => handleRevertClick(data.row, refresh)}
                disabled={data.row.status == 3 || data.row.status === 1}
              >
                归还
              </BaseButton>
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
      const res = await dataConfigurationDictionaryList({ category: 1, with_del: true })
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
      options: statusType,
      placeholder: '请选择状态',
      multiple: true
    }
  },
  {
    field: 'name',
    label: '',
    component: 'Input',
    componentProps: {
      options: statusType,
      placeholder: '请输入物品名称查询'
    }
  }
])

const searchParams = ref({})

const { tableRegister, tableMethods, tableState } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await dataAssetsFixedPage({
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

const handleDeleteClick = useHandleDeleteClick(refresh)

const { loading, dataList, total, currentPage, pageSize } = tableState

const handleSearch = (data: any) => {
  searchParams.value = data
  getList()
}

const handleAddClick = () => {
  push('/assets/add')
}

const handleResetClick = () => {
  searchParams.value = {}
  refresh()
}

const handleDetailClick = (row: any) => {
  push({
    path: `/assets/${row.id}/detail`,
    query: {
      op: 'detail'
    }
  })
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
