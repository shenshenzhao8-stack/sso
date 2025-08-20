<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import type { TableData } from '@/api/table/types'
import { reactive, ref, unref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useEventBus } from '@/hooks/event/useEventBus'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { Permission } from '@/components/Permission'
import { formatTime } from '@/utils'
import { useUserStore } from '@/stores/user'
import { deleteKnowledgeBase, getKnowledgeBase, getListKnowledgeBase } from '@/api/knowledgeBase'
import { getDictEags } from '@/api/tag'
import EditLookDrawer from '../AddKnowledge/components/EditLookDrawer.vue'

const show = ref(false)
const catchDate = ref<any>()

defineOptions({
  name: 'KnowledgeView'
})

const userStore = useUserStore()
const { push } = useRouter()

const searchParams = ref<any>({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getListKnowledgeBase({
      page: unref(currentPage),
      limit: unref(pageSize),
      key_word: unref(searchParams).title,
      business_tag: unref(searchParams).business_tags,
      content_tag: unref(searchParams).content_tags
    })
    return {
      list: res.data.items,
      total: res.data.pagination.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

useEventBus({
  name: 'getList',
  callback: (type: string) => {
    if (type === 'add') {
      currentPage.value = 1
    }
    getList()
  }
})

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index',
    search: {
      hidden: true
    },
    form: {}
  },
  {
    field: 'business_tags',
    label: '业务标签',
    search: {
      hidden: false,
      component: 'Select',
      colProps: {
        span: 12
      },
      componentProps: {
        filterable: true,
        multiple: true,
        style: 'width: 150px',
        placeholder: '请选择业务标签'
      },
      optionApi: async () => {
        const res = await getDictEags({
          category: '1,3'
        })
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
          const row = data.row
          return <>{row.business_tags?.map((item: any) => item.name).join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'content_tags',
    label: '内容标签',
    search: {
      hidden: false,
      component: 'Select',
      colProps: {
        span: 12
      },
      componentProps: {
        filterable: true,
        multiple: true,
        style: 'width: 150px',
        placeholder: '请选择内容标签'
      },
      optionApi: async () => {
        const res = await getDictEags({
          category: '1,3'
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
          const row = data.row
          return <>{row.content_tags?.map((item: any) => item.name).join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'title',
    label: '标题',
    search: {
      hidden: false,
      componentProps: {
        style: 'width: 150px'
      }
    }
  },

  {
    field: 'start_at',
    label: '发布时间',
    width: '170px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.created_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    width: 250,
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        const isCreateUser = userStore.userInfo?.id && userStore.userInfo?.id == data.row?.creator
        const isAdmin = userStore.userInfo?.id && userStore.userInfo?.id == 1

        return (
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {isCreateUser || isAdmin ? (
              <Permission permission="PUT">
                <BaseButton type="primary" onClick={() => action(row, 'edit')}>
                  编辑
                </BaseButton>
              </Permission>
            ) : (
              <></>
            )}
            <Permission permission="GET">
              <BaseButton type="primary" onClick={() => action(row, 'look')}>
                查看
              </BaseButton>
            </Permission>
            {isCreateUser || isAdmin ? (
              <Permission permission="DELETE">
                <BaseButton
                  type="danger"
                  onClick={() => {
                    ElMessageBox.confirm('确定删除该资料库？', '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(async () => {
                      deleteKnowledgeBase({ id: row.id }).then((res: any) => {
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
            ) : (
              <></>
            )}
          </div>
        )
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const AddAction = () => {
  push('/knowledge-management/add-knowledge')
}

const action = async (row: TableData, type: string = 'look') => {
  if (type == 'look') {
    const result = await getKnowledgeBase({ id: row.id })

    catchDate.value = {
      ...result.data
    }
    show.value = true
  } else {
    push(`/knowledge-management/add-knowledge?id=${row.id}&edit_type=${type}`)
  }
}

onActivated(() => {
  getList()
})
onMounted(async () => {})
</script>

<template>
  <ContentWrap>
    <EditLookDrawer :title="'资料库信息详情'" v-model:model-value="show" :echoData="catchDate" />

    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <Permission permission="POST">
        <BaseButton type="primary" @click="AddAction">新增</BaseButton>
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
      @register="tableRegister"
      @rowClick="(row:any) => action(row)"
    />
  </ContentWrap>
</template>
