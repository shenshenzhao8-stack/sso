<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { deleteExam, getExamListExam, getExamBatchList } from '@/api/examination'
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

defineOptions({
  name: 'ExaminationView'
})

const userStore = useUserStore()
const { push } = useRouter()

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getExamListExam({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
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
    field: 'batch',
    label: '期数',
    width: '100px',
    search: {
      hidden: false,
      component: 'Select',
      colProps: {
        span: 12
      },
      componentProps: {
        filterable: true,
        style: {
          width: '150px'
        },

        options: []
      }
    }
  },
  {
    field: 'title',
    label: '标题',
    search: {
      hidden: false
    }
  },

  {
    field: 'status',
    label: '状态',
    width: 100,
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        switch (data.row.status) {
          case 1:
            return <div class={'text-#2089e1'}>进行中</div>
          case 2:
            return '未开始'
          case 3:
            return '已结束'
          default:
            return '未知'
        }
      }
    }
  },
  {
    field: 'pageviews',
    label: '考试总人数',
    width: '100px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        return data.row?.users?.length || 0
      }
    }
  },
  {
    field: 'passed_count',
    label: '已通过人数',
    width: '100px',
    search: {
      hidden: true
    }
  },
  {
    field: 'un_passed_count',

    label: '未通过人数',
    width: '100px',
    search: {
      hidden: true
    }
  },
  {
    field: 'un_part_count',
    label: '未参与人数',
    width: '100px',
    search: {
      hidden: true
    }
  },
  {
    field: 'start_at',
    label: '开始时间',
    width: '170px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.start_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'end_at',
    label: '结束时间',
    width: '170px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.end_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'creator',
    label: '发布人',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        return data.row?.creator_info?.name || ''
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
        const isCreateUser =
          userStore.userInfo?.id && userStore.userInfo?.id == data.row?.creator_info?.id
        const isAdmin = userStore.userInfo?.id && userStore.userInfo?.id == 1
        return (
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {row.status === 2 && (isCreateUser || isAdmin) ? (
              <Permission permission="PUT">
                <BaseButton type="primary" onClick={() => action(row, 'edit')}>
                  编辑
                </BaseButton>
              </Permission>
            ) : (
              <></>
            )}
            <Permission permission="GET">
              <BaseButton type="primary" onClick={() => action(row)}>
                查看
              </BaseButton>
            </Permission>
            {isCreateUser || isAdmin ? (
              <Permission permission="DELETE">
                <BaseButton
                  type="danger"
                  onClick={() => {
                    ElMessageBox.confirm('确定删除该考卷？', '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(async () => {
                      deleteExam(row.id).then((res: any) => {
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
  push('/examination-management/add-examination')
}

const action = (row: TableData, type: string = 'look') => {
  push(`/examination-management/add-examination?id=${row.id}&edit_type=${type}`)
}

onActivated(() => {
  getList()
})
onMounted(async () => {
  const { data } = await getExamBatchList({
    page: 1,
    limit: 200
  })

  crudSchemas[1].search!.componentProps.options = (data.items || []).map((item: any) => {
    return {
      label: item,
      value: item
    }
  })
})
</script>

<template>
  <ContentWrap>
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
