<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { deleteTraining, getListTraining, getTrainingBatchList } from '@/api/training'
import { useTable } from '@/hooks/web/useTable'
import type { TableData } from '@/api/table/types'
import { reactive, ref, unref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { Permission } from '@/components/Permission'
import { formatTime } from '@/utils'
import { useUserStore } from '@/stores/user'

defineOptions({
  name: 'TrainingView'
})

const { push } = useRouter()
const userStore = useUserStore()
const searchParams = ref<{ title?: string; batch?: number }>({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getListTraining({
      page: unref(currentPage),
      limit: unref(pageSize),
      title: unref(searchParams).title,
      batch: unref(searchParams).batch
    })
    return {
      list: res.data.items,
      total: res.data.pagination.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList } = tableMethods

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
    field: 'is_need_exam',
    label: '是否考试',
    width: '110px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        return data.row.is_need_exam ? <div class={'text-#2089e1'}>是</div> : '否'
      }
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
    label: '培训总人数',
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
    field: 'active_user_count',
    label: '已参与人数',
    width: '100px',
    search: {
      hidden: true
    }
  },
  {
    field: 'un_active_user_count',
    label: '未参与人数',
    width: '100px',
    search: {
      hidden: true
    }
  },
  {
    field: 'passed_count',
    label: '已通过与人数',
    width: '110px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        if (!data.row.is_need_exam) return '-'
        return data.row?.passed_count || 0
      }
    }
  },
  {
    field: 'un_passed_count',
    label: '未通过人数',
    width: '100px',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        if (!data.row.is_need_exam) return '-'
        return data.row?.un_passed_count || 0
      }
    }
  },
  {
    field: 'start_at',
    label: '开始时间',
    width: '180px',
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
    width: '180px',
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
                    ElMessageBox.confirm('确定删除该培训？', '提示', {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning'
                    }).then(async () => {
                      deleteTraining({ id: row.id }).then((res: any) => {
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
  push('/training-management/add-training')
}

const action = (row: TableData, type: string = 'look') => {
  push(`/training-management/add-training?id=${row.id}&edit_type=${type}`)
}

onActivated(() => {
  getList()
})

onMounted(async () => {
  const { data } = await getTrainingBatchList({
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
      @rowClick="(row:any) => action(row)"
      @register="tableRegister"
    />
  </ContentWrap>
</template>
