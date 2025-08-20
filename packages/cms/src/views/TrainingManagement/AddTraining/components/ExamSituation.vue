<template>
  <div class="exam-situation">
    <ElDivider content-position="left">考题内容</ElDivider>

    <Table :columns="allSchemas.tableColumns" :data="dataList" />

    <ExamSituationDrawer
      v-if="showDrawer"
      v-model:model-value="showDrawer"
      :id="activeRow?.exam?.id"
      :echo-data="{
        ...(activeRow?.exam || {}),
        title: activeRow?.title
      }"
      :default-active-tab="defaultActiveTab"
      :create-user-id="echoData?.creator_info?.id"
      @close="closeDrawer"
    />
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref, unref, watch } from 'vue'
import { ElDivider } from 'element-plus'
import { Table } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatTime } from '@/utils'
import ExamSituationDrawer from './ExamSituationDrawer.vue'
import cloneDeep from 'lodash-es/cloneDeep'
import { getExamResultCount } from '@/api/examination'

const activeRow = ref<any>()
const dataList = ref<any[]>([])
const showDrawer = ref<boolean>(false)
const defaultActiveTab = ref<'first' | 'second'>('first')

const props = defineProps({
  echoData: {
    type: Object,
    default: () => {}
  },
  disabled: {
    type: Boolean,
    default: false
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
    field: 'title',
    label: '关联培训内容',
    search: {
      hidden: false
    }
  },
  {
    field: 'questions',
    label: '题目数量',
    search: {
      hidden: false
    },
    slots: {
      default: ({ row }: any) => {
        return <>{row?.exam?.questions?.length || 0}</>
      }
    }
  },
  {
    field: 'pass_score',
    label: '通过分值',
    search: {
      hidden: false
    },
    slots: {
      default: ({ row }: any) => {
        return <>{row?.exam?.pass_score || 0}</>
      }
    }
  },
  {
    field: 'all_count',
    label: '培训总人数',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        return (row?.active_user_count || 0) + (row?.un_active_user_count || 0)
      }
    }
  },
  {
    field: 'passed_count',
    label: '已通过人数',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        return (
          <>
            <BaseButton link type="primary" onClick={() => action('first', row)}>
              {row?.exam?.passed_count || 0}
            </BaseButton>
          </>
        )
      }
    }
  },
  {
    field: 'un_passed_count',
    label: '未通过人数',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        return (
          <>
            <BaseButton link type="primary" onClick={() => action('second', row)}>
              {row?.exam?.un_passed_count || 0}
            </BaseButton>
          </>
        )
      }
    }
  },
  {
    field: 'updated_at',
    label: '更新时间',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.updated_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  }
])

const action = (data: 'first' | 'second', row: any) => {
  activeRow.value = row
  defaultActiveTab.value = data
  showDrawer.value = true
}

watch(
  () => props.echoData?.id,
  () => {
    dataList.value = cloneDeep(props.echoData?.trainings_courses || [])
  },
  {
    immediate: true
  }
)

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const closeDrawer = async () => {
  if (!activeRow.value?.exam?.id) return
  const result = await getExamResultCount({ exam_id: activeRow.value?.exam?.id })
  if (result.code === 200) {
    const { un_passed_count = 0, passed_count = 0 } = result.data || {}
    dataList.value = dataList.value.map((item) => {
      if (item.exam.id === activeRow.value?.exam?.id) {
        item.exam.un_passed_count = un_passed_count
        item.exam.passed_count = passed_count
      }

      return item
    })
  }
}
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
