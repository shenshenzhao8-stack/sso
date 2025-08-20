<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { useRouter } from 'vue-router'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { getDictEags } from '@/api/tag/index'
import { getNewsListApi, deleteNewsApi } from '@/api/content/index'
import { type ContentItemType } from '@/api/content/types'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/index'
import { Permission } from '@/components/Permission'

const { push } = useRouter()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getNewsListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
    })
    res.data.items?.forEach((item: ContentItemType) => {
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
    const res = await deleteNewsApi({ id: currentRow.value?.id })
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
    field: 'business_tags',
    label: '业务标签',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        placeholder: '请选择业务标签',
        multiple: true
      },
      optionApi: async () => {
        const res = await getDictEags()
        return (
          res.data?.business_tags?.map((item: any) => {
            return {
              label: item.name,
              value: item.id
            }
          }) ?? []
        )
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ContentItemType
          return <>{row.business_tags?.map((item: any) => item.name).join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'content_tags',
    label: '内容标签',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        placeholder: '请选择内容标签',
        multiple: true
      },
      optionApi: async () => {
        const res = await getDictEags({
          category: '2'
        })
        return (
          res.data?.content_tags?.map((item: any) => {
            return {
              label: item.name,
              value: item.id
            }
          }) ?? []
        )
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ContentItemType
          return <>{row.content_tags?.map((item: any) => item.name).join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'title',
    label: '标题',
    search: {
      component: 'Input',
      componentProps: {
        placeholder: '请输入标题关键字查询',
        style: {
          width: '200px'
        }
      }
    }
  },
  {
    field: 'created_at',
    label: '发布时间',
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
          const row = data.row as ContentItemType
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
                  <BaseButton type="primary" onClick={() => previewAction(row)}>
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
const searchParams = ref({})
const currentRow = ref<ContentItemType>()

const searchAction = (params: any) => {
  const business_tag_ids = params.business_tags?.join(',')
  const content_tag_ids = params.content_tags?.join(',')
  searchParams.value = {
    business_tag: business_tag_ids,
    content_tag: content_tag_ids,
    key_word: params.title
  }
  getList()
}

const addAction = () => {
  push('/content-management/add')
}

const previewAction = (row: ContentItemType) => {
  push({
    path: '/content-management/detail',
    query: {
      id: row.id
    }
  })
}

const editAction = (row: ContentItemType) => {
  push({
    path: '/content-management/edit',
    query: {
      id: row.id
    }
  })
}

const deleteAction = async (row: ContentItemType) => {
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
      @rowClick="previewAction"
    />
  </ContentWrap>
</template>
