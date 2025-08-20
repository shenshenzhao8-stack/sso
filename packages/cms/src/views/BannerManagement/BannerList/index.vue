<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ElImage, ElMessage } from 'element-plus'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { useRouter } from 'vue-router'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { getBannerListApi, deleteBannerApi } from '@/api/banner/index'
import type { BannerItemType } from '@/api/banner/types'
import { formatTime } from '@/utils/index'
import { Permission } from '@/components/Permission'

const { push } = useRouter()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getBannerListApi({
      page: unref(currentPage),
      limit: unref(pageSize)
    })
    res.data.items?.forEach((item: BannerItemType) => {
      item.created_at = formatTime(item.created_at, 'yyyy-MM-dd HH:mm:ss')
    })
    return {
      list: res.data?.items ?? [],
      total: res.data?.pagination?.total ?? 0
    }
  },
  fetchDelApi: async () => {
    if (!currentRow.value?.id) {
      ElMessage.error('删除失败')
      return false
    }
    const res = await deleteBannerApi({ id: currentRow.value?.id })
    return res.code === 200
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { delList } = tableMethods

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: '序号',
    table: {
      type: 'index'
    }
  },
  {
    field: 'title',
    label: '标题'
  },
  {
    field: 'picture_url',
    label: '图片',
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as BannerItemType
          return (
            <div
              class="inline"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <ElImage
                class="h-[50px] mr-10px"
                src={row.picture_url}
                fit="cover"
                lazy
                preview-src-list={[row.picture_url]}
                preview-teleported
              />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'target_url',
    label: '跳转链接'
  },
  {
    field: 'created_at',
    label: '发布时间'
  },
  {
    field: 'action',
    label: '操作',
    table: {
      width: 240,
      slots: {
        default: (data: any) => {
          const row = data.row as BannerItemType
          return (
            <>
              <Permission permission="PUT">
                <div
                  class="inline mr-10px"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <BaseButton type="primary" onClick={() => editAction(row)}>
                    编辑
                  </BaseButton>
                </div>
              </Permission>
              <Permission permission="GET">
                <div
                  class="inline mr-10px"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <BaseButton type="primary" onClick={() => detailAction(row)}>
                    查看
                  </BaseButton>
                </div>
              </Permission>
              <Permission permission="DELETE">
                <div
                  class="inline"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <BaseButton
                    loading={unref(delLoading)}
                    type="danger"
                    onClick={() => deleteAction(row)}
                  >
                    删除
                  </BaseButton>
                </div>
              </Permission>
            </>
          )
        }
      }
    }
  }
])
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const delLoading = ref(false)
const currentRow = ref<BannerItemType>()

const addAction = () => {
  push('/banner-management/add')
}

const editAction = (row: BannerItemType) => {
  push({
    path: '/banner-management/edit',
    query: {
      id: row.id
    }
  })
}

const detailAction = (row: BannerItemType) => {
  push({
    path: '/banner-management/detail',
    query: {
      id: row.id
    }
  })
}

const deleteAction = async (row: BannerItemType) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}
</script>

<template>
  <ContentWrap>
    <div class="mb-10px">
      <Permission permission="POST">
        <BaseButton type="primary" @click="addAction">新增</BaseButton>
      </Permission>
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
      :row-style="
        () => {
          return {
            cursor: 'pointer'
          }
        }
      "
      @register="tableRegister"
      @rowClick="detailAction"
    />
  </ContentWrap>
</template>
