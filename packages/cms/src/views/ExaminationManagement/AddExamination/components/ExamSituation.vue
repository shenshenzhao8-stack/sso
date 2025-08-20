<template>
  <div class="exam-situation">
    <ExaminationQuestionsDrawer
      ref="examinationQuestionsDrawerRef"
      v-model:model-value="showDrawer"
      :name="activeRow?.name"
      :defalutMenuId="defalutMenuId"
      :create-user-id="createUserId"
      @close="closeDrawer"
    />
    <ElDivider content-position="left">
      <div class="flex items-center">
        考试情况
        <BaseButton class="!text-#409eff" text @click="downloadExamResult">下载</BaseButton>
      </div>
    </ElDivider>
    <ElTabs v-model="activeName">
      <ElTabPane name="first" :label="`已通过 (${passed_total}人)`">
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
        />
      </ElTabPane>
      <ElTabPane name="second" :label="`未通过 (${un_passed_total}人)`">
        <Table
          v-model:pageSize="notPageSize"
          v-model:currentPage="notCurrentPage"
          :columns="allSchemas.tableColumns"
          :data="notDataList"
          :loading="notLoading"
          :pagination="{
            total: notTotal
          }"
          :row-style="
            ({ row }) => {
              return {
                backgroundColor: row.all_passed === 2 ? '#FFDEAD' : '#FFF'
              }
            }
          "
          @register="notTableRegister"
        />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref, unref, nextTick, watch } from 'vue'
import { ElDivider, ElTabs, ElTabPane, ElMessageBox, ElMessage } from 'element-plus'
import { Table } from '@/components/Table'
import ExaminationQuestionsDrawer from './ExaminationQuestionsDrawer.vue'
import {
  getExamResultList,
  deleteExamResult,
  getExamResultCount,
  downloadExamResultFile
} from '@/api/examination'
import { useTable } from '@/hooks/web/useTable'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatTime } from '@/utils'

const activeName = ref('first')
const showDrawer = ref(false)
const activeRow = ref<any>()
const un_passed_total = ref(0)
const passed_total = ref(0)
const examinationQuestionsDrawerRef = ref<InstanceType<typeof ExaminationQuestionsDrawer>>()

const props = defineProps({
  echoData: {
    type: Object,
    default: () => {}
  },
  id: {
    type: String,
    default: ''
  },
  defaultActiveTab: {
    type: String,
    default: ''
  },
  defalutMenuId: {
    type: Number,
    default: 14
  },
  createUserId: {
    type: Number,
    default: -1
  }
})

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getExamResultList({
      page: unref(currentPage),
      limit: unref(pageSize),
      id: props.echoData.id,
      passed: 1
    })
    return {
      list: res.data.items,
      total: res.data.pagination.total
    }
  }
})

const { total, dataList, loading, pageSize, currentPage } = tableState

const {
  tableRegister: notTableRegister,
  tableState: notTableState,
  tableMethods: notTableMethods
} = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = notTableState
    const res = await getExamResultList({
      page: unref(currentPage),
      limit: unref(pageSize),
      id: props.echoData.id,
      passed: 2
    })
    return {
      list: res.data.items,
      total: res.data.pagination.total
    }
  }
})

const {
  total: notTotal,
  dataList: notDataList,
  loading: notLoading,
  pageSize: notPageSize,
  currentPage: notCurrentPage
} = notTableState

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
    field: 'email',
    label: '邮箱',
    search: {
      hidden: false
    }
  },
  {
    field: 'name',
    label: '人员姓名',
    search: {
      hidden: false
    }
  },
  {
    field: 'score',
    label: '分值',
    search: {
      hidden: true
    }
  },
  {
    field: 'end_time',
    label: '提交时间',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.end_time, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'action',
    width: '260px',
    label: '操作',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        return (
          <>
            <BaseButton
              link
              type="primary"
              onClick={() => {
                showDrawer.value = true
                console.log(row)
                nextTick(() => {
                  activeRow.value = row
                  examinationQuestionsDrawerRef.value?.init(row.exam_result_id)
                })
              }}
            >
              查看考试
            </BaseButton>
            <BaseButton
              link
              type="danger"
              onClick={() => {
                console.log(row)
                ElMessageBox.confirm('确定删除该条记录吗？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  deleteExamResult({ id: row.exam_result_id }).then((res) => {
                    if (res.code == 200) {
                      if (activeName.value === 'first') {
                        tableMethods.getList()
                      } else {
                        notTableMethods.getList()
                      }
                      ElMessage.success('删除成功')
                    } else {
                      ElMessage.error(res.msg)
                    }
                  })
                })
              }}
            >
              删除
            </BaseButton>
          </>
        )
      }
    }
  }
])

const closeDrawer = () => {
  getCount()
  tableMethods.getList()
  notTableMethods.getList()
}

const getCount = async () => {
  const result = await getExamResultCount({ exam_id: props.echoData.id })
  if (result.code === 200) {
    const { un_passed_count = 0, passed_count = 0 } = result.data || {}
    un_passed_total.value = un_passed_count
    passed_total.value = passed_count
  } else {
    ElMessage.error(result.msg)
  }
}

const downloadExamResult = async () => {
  if (!props.echoData?.id) return
  const res = await downloadExamResultFile({ id: props.echoData.id })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `第${props.echoData?.batch}期-${props.echoData?.title}考试结果.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

watch(
  () => props.id,
  () => {
    if (props.id) getCount()
  },
  {
    immediate: true
  }
)

watch(
  () => props.defaultActiveTab,
  (value) => {
    if (value) activeName.value = props.defaultActiveTab
  },
  {
    immediate: true
  }
)

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<style lang="less" scoped>
.exam-situation {
  margin-top: 20px;

  :deep(.el-tabs__nav-scroll) {
    display: flex;
    justify-content: center;
  }
}
</style>
