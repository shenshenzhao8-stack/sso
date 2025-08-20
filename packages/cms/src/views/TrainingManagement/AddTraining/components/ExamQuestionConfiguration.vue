<template>
  <div class="exam-situation">
    <ElDivider content-position="left">配置内容</ElDivider>
    <Table :columns="allSchemas.tableColumns" :data="dataList" />
    <ExamQuestionConfigurationDrawer
      v-if="showDrawer"
      ref="examinationQuestionConfigurationDrawerRef"
      v-model:model-value="showDrawer"
      :title="'配置考试题目'"
      :id="echoContentRow?.id ? echoContentRow?.id + '' : ''"
      :training-data="echoContentRow"
      :echo-data="echoContentRow?.exam"
    >
      <template #footer>
        <div class="m-t10px">
          <BaseButton type="primary" @click="save">保存 </BaseButton>
          <BaseButton @click="cancel">取消</BaseButton>
        </div>
      </template>
    </ExamQuestionConfigurationDrawer>
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref, watch } from 'vue'
import { ElDivider, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatTime } from '@/utils'
import ExamQuestionConfigurationDrawer from './ExamQuestionConfigurationDrawer.vue'
import { useEventBus } from '@/hooks/event/useEventBus'
import { cloneDeep } from 'lodash-es'
import { getListQuestionIds } from '@/api/question'
const examinationQuestionConfigurationDrawerRef =
  ref<ComponentRef<typeof ExamQuestionConfigurationDrawer>>()
const showDrawer = ref<boolean>(false)
const echoContentRow = ref<any>({})

const props = defineProps({
  echoData: {
    type: Object,
    default: () => {}
  },
  id: {
    type: String,
    default: ''
  }
})

const dataList = ref<any[]>([])

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
    field: 'name',
    label: '题目数量',
    search: {
      hidden: false
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{row.exam?.questions?.length || 0}</>
      }
    }
  },
  {
    field: 'name',
    label: '通过分值',
    search: {
      hidden: false
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{row.exam?.pass_score || 0}</>
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
            <BaseButton link type="primary" onClick={() => action(row)}>
              配置考试题目
            </BaseButton>
          </>
        )
      }
    }
  }
])

const action = async (row: any) => {
  const data = cloneDeep(row)
  if (row?.exam?.questions && row?.exam?.questions.length) {
    const ids = row?.exam?.questions.map((item: any) => (item.origin_id ? item.origin_id : item.id))

    const result = await getListQuestionIds({ ids })
    if (result.code == 200) {
      data.exam.questions = result.data.list
      data.exam.question_ids = data.exam.questions.map((item: any) => item.id)
    }
  }

  echoContentRow.value = data

  showDrawer.value = true

  if (data?.exam?.questions?.length != row?.exam?.questions.length) {
    ElMessageBox.confirm('您配置的部分题目已被删除请更新数据', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancelButton: false,
      type: 'warning'
    }).then(() => {})
  }
}

const submit = () => {
  return dataList.value.map((item) => {
    const { pass_score, duration, question_ids, questions = [] } = item.exam || {}
    return {
      ...item,
      exam: {
        pass_score,
        duration,
        question_ids: question_ids ? question_ids : questions.map((item: any) => item.origin_id),
        questions,
        // 无效字段 后端为过网管 不加会报错
        business_tag_ids: [0],
        content_tag_ids: [0],
        end_at: new Date(),
        start_at: new Date(),
        title: '11',
        users: [0]
      }
    }
  })
}

const save = async () => {
  const result = await examinationQuestionConfigurationDrawerRef.value?.submit()
  if (!result) return
  showDrawer.value = false
  const index = dataList.value.findIndex((item) => item.id === echoContentRow.value.id)
  dataList.value[index] = {
    ...echoContentRow.value,
    exam: {
      ...result
    }
  }
}

const cancel = () => {
  showDrawer.value = false
}
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

defineExpose({
  submit
})

useEventBus({
  name: 'addTrainingContent',
  callback: (data: any) => {
    dataList.value.push(data)
  }
})

useEventBus({
  name: 'delTrainingContent',
  callback: (index: number) => {
    dataList.value.splice(index, 1)
  }
})

useEventBus({
  name: 'updateTrainingContent',
  callback: (data: any) => {
    Object.assign(
      dataList.value[dataList.value.findIndex((item: any) => item.id === data.id)],
      data
    )
  }
})

useEventBus({
  name: 'trainingContentOrderChange',
  callback: (ids: string[]) => {
    dataList.value = ids
      .map((id) => dataList.value.find((item) => item.id === id))
      .filter((item) => item)
  }
})

watch(
  () => props.echoData?.id,
  () => {
    dataList.value = cloneDeep(props.echoData?.trainings_courses || [])
  },
  {
    immediate: true
  }
)
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
