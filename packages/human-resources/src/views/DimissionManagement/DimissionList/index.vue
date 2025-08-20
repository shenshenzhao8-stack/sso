<script setup lang="tsx">
import { reactive, ref, unref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { useRouter } from 'vue-router'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/index'
import { Permission } from '@/components/Permission'
import { getDictListApi, getResignationListApi, deleteResignationApi } from '@/api/dimission/index'
import type {
  ResignationItemType,
  DictItemType,
  DictExtraItemType,
  EmailGroupItemType
} from '@/api/dimission/types'

const { push } = useRouter()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getResignationListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
    })
    res.data.result?.forEach((item: ResignationItemType) => {
      item.last_working_date_time = formatTime(item.last_working_date_time, 'yyyy-MM-dd')
      item.created_at = formatTime(item.created_at, 'yyyy-MM-dd HH:mm:ss')
      item.updated_at = formatTime(item.updated_at, 'yyyy-MM-dd HH:mm:ss')
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
    const res = await deleteResignationApi({ id: currentRow.value?.id })
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
    label: '离职员工',
    search: {
      componentProps: {
        style: {
          width: '200px'
        },
        placeholder: '请输入离职员工姓名查询'
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{row.user_info?.name ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'approver_info',
    label: '审批人',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          const approver_names = row.approver_info?.map((item: any) => item.name) ?? []
          return <>{approver_names.join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'user_type_id',
    label: '员工类型',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{row.user_type_info.name ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'type_id',
    label: '离职类型',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        on: {
          change: (value: number) => {
            searchTypeChange(value)
          }
        },
        placeholder: '请选择离职类型'
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{row.type_info.name ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'sub_type_id',
    label: '离职类别',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        placeholder: '请选择离职类别'
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{row.sub_type_info?.name ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'liquidated_damages_type',
    label: '违约金',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{row.liquidated_damages_type === 1 ? '无' : '有'}</>
        }
      }
    }
  },
  {
    field: 'compensation_type',
    label: '赔偿金',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{getCompensationTypeText(row.compensation_type)}</>
        }
      }
    }
  },
  {
    field: 'last_working_date_time',
    label: '最后工作日期',
    search: {
      hidden: true
    }
  },
  {
    field: 'processing_date_range_time',
    label: '离职手续办理日期',
    search: {
      component: 'DatePicker',
      componentProps: {
        type: 'daterange',
        style: {
          width: '250px'
        }
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{formatTime(row.processing_date_time, 'yyyy-MM-dd') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'contract_belongs_to_info_id',
    label: '合同归属',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          return <>{row.contract_belongs_to_info.name ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'total_paid_leave',
    label: '当年可休小时数（带薪假）',
    search: {
      hidden: true
    }
  },
  {
    field: 'remaining_paid_leave',
    label: '可休剩余小时数（带薪假）',
    search: {
      hidden: true
    }
  },
  {
    field: 'adjusted_leave',
    label: '串休剩余小时数',
    search: {
      hidden: true
    }
  },
  {
    field: 'reason',
    label: '离职原因',
    search: {
      hidden: true
    }
  },
  {
    field: 'remark',
    label: '备注',
    search: {
      hidden: true
    }
  },
  {
    field: 'email_group',
    label: '邮件组',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as ResignationItemType
          const emails =
            row.email_group?.map((item: EmailGroupItemType) => item.user_info?.email) ?? []
          return <>{emails.join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'updated_at',
    label: '提交时间',
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
          const row = data.row as ResignationItemType
          return (
            <>
              <div
                class="inline"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <BaseButton
                  loading={unref(delLoading)}
                  type="primary"
                  onClick={() => editAction(row)}
                >
                  编辑
                </BaseButton>
              </div>
              <div
                class="inline ml-10px"
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
            </>
          )
        }
      }
    }
  }
])
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const searchRef = ref<InstanceType<typeof Search>>()
const resignationTypeAry = ref<DictItemType[]>([])
const resignationSubTypeAry = ref<DictExtraItemType[]>([])
const delLoading = ref(false)
const searchParams = ref({})
const currentRow = ref<ResignationItemType>()

onMounted(() => {
  getDictList()
})

const getCompensationTypeText = (type: number) => {
  if (type === 1) {
    return '无'
  } else if (type === 2) {
    return '有（标准）'
  } else if (type === 3) {
    return '有（其他）'
  }
  return '-'
}

const searchTypeChange = (type: number) => {
  searchRef.value?.setValues({
    sub_type_id: undefined
  })
  resignationSubTypeAry.value =
    resignationTypeAry.value.find((item: DictItemType) => item.id === type)?.extra || []
  if (!crudSchemas[5].search) return
  crudSchemas[5].search.componentProps.options = resignationSubTypeAry.value.map(
    (item: DictExtraItemType) => {
      return {
        label: item.name,
        value: item.id
      }
    }
  )
}

const searchAction = (params: any) => {
  let nextDay
  if (params.processing_date_range_time?.[1]) {
    nextDay = new Date(params.processing_date_range_time?.[1])
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0)
  }

  searchParams.value = {
    username: params.name,
    resignation_type_ids: params.type_id ? [params.type_id] : undefined,
    resignation_sub_type_ids: params.sub_type_id ? [params.sub_type_id] : undefined,
    start: params.processing_date_range_time?.[0]?.toISOString(),
    end: nextDay?.toISOString()
  }
  getList()
}

const addAction = () => {
  push('/dimission-management/add')
}

const previewAction = (row: any) => {
  push({
    path: '/dimission-management/detail',
    query: {
      id: row.id
    }
  })
}

const editAction = (row: any) => {
  push({
    path: '/dimission-management/edit',
    query: {
      id: row.id
    }
  })
}

const deleteAction = async (row: ResignationItemType) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}

const getDictList = async () => {
  const res = await getDictListApi({ type: 2 })
  resignationTypeAry.value = res.data.result ?? []
  if (!crudSchemas[4].search) return
  crudSchemas[4].search.componentProps.options = resignationTypeAry.value.map((item: any) => {
    return {
      label: item.name,
      value: item.id
    }
  })
}
</script>

<template>
  <ContentWrap>
    <Search
      ref="searchRef"
      :schema="allSchemas.searchSchema"
      @search="searchAction"
      @reset="searchAction"
    />
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

<style lang="less" scoped>
:deep(.el-form-item__label-wrap) {
  margin-left: 0 !important;
}
</style>
