<template>
  <ElDrawer v-model:model-value="dialogVisible" size="80vw" v-bind="$attrs" @close="close">
    <div class="h-78vh overflow-hidden">
      <div class="text-14px h-30px text-[#666] mb-20px">
        关联培训内容：{{ trainingData?.title }}
      </div>
      <div class="flex flex-col h-[calc(100%-50px)]">
        <div class="h-100px">
          <Form
            :rules="rules"
            class="cosurm-form"
            @register="formRegister"
            :schema="schema"
            :disabled="disabled"
          />
          <div class="flex justify-between items-center">
            <div class="flex items-center text-14px text-[#666]">
              <div class="ml-10px">已选择：{{ allSelectDataList.length }} 道题</div>
              <div class="ml-50px">总分值：{{ score }}分</div>
            </div>
            <div class="mr-10px">
              <BaseButton type="primary" @click="preview">预览考题</BaseButton>
              <BaseButton type="primary" @click="add">新增题目</BaseButton>
            </div>
          </div>
        </div>
        <ElDivider />
        <div class="flex justify-between h-[calc(100%-100px)] overflow-hidden">
          <div class="tree-box">
            <ElScrollbar>
              <el-tree
                :data="treeData"
                show-checkbox
                default-expand-all
                node-key="id"
                ref="treeRef"
                highlight-current
                :props="{
                  children: 'children',
                  label: 'label'
                }"
                @check="onCheckTree"
              />
            </ElScrollbar>
          </div>
          <div class="flex-1 table-box">
            <Table
              style="height: 100%"
              v-model:pageSize="pageSize"
              v-model:currentPage="currentPage"
              :columns="allSchemas.tableColumns"
              :data="tableDate"
              :loading="loading"
              :pagination="{
                total: total
              }"
              @register="tableRegister"
              @selection-change="selectionChange"
              :show-overflow-tooltip="false"
            />
          </div>
        </div>
      </div>
    </div>

    <slot name="footer"></slot>
    <ElDrawer v-model="previewVal" title="预览考题" size="80vw" :max-height="500">
      <div class="text-14px text-[#666] mb-20px">关联培训内容：{{ trainingData?.title }}</div>
      <PreviewQuestions ref="previewQuestionsRef" />
      <template #footer>
        <BaseButton type="primary" @click="saveQuestions"> 更新 </BaseButton>
        <BaseButton @click="previewVal = false">关闭</BaseButton>
      </template>
    </ElDrawer>
  </ElDrawer>

  <!-- 添加题目 -->
  <ElDrawer v-model="showAddQuestions" size="1000px">
    <AddQuestions class="addQuestions" ref="addQuestionsRef" v-if="showAddQuestions">
      <template #header>
        <BaseButton
          class="pos-absolute left-40px top-40px"
          @click="() => (showAddQuestions = false)"
        >
          返回
        </BaseButton>
      </template>
      <template #footer>
        <BaseButton class="m-t10px" type="primary" @click="addQuestion"> 新增 </BaseButton>
      </template>
    </AddQuestions>
  </ElDrawer>
</template>

<script setup lang="tsx">
import { Form, type FormSchema } from '@/components/Form'
import { reactive, unref, ref, onMounted, watch, nextTick, computed } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import {
  ElInputNumber,
  ElDivider,
  ElTree,
  ElDrawer,
  ElTag,
  ElMessage,
  ElScrollbar
} from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { BaseButton } from '@/components/Button'
import { getQuestionType, getTimeNumber } from '@/utils/index'
import AddQuestions from '@/views/QuestionManagement/AddQuestion/index.vue'
const { formRegister, formMethods } = useForm()
const { required } = useValidator()
import { useTable } from '@/hooks/web/useTable'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import PreviewQuestions from './PreviewQuestions.vue'
import { getDictEags } from '@/api/tag'
import { getQuestionApi, getQuestionListApi } from '@/api/question'
import { AnswerView } from '@/components/AnswerView'
import type { QuestionItemType } from '@/api/question/type'

const showAddQuestions = ref<boolean>(false)

const treeRef = ref<InstanceType<typeof ElTree>>()
const tableDate = ref<any[]>([])
// 存储所有选中的题目数据
const allSelectDataList = ref<any[]>([])
const nowTableSelectDateList = ref<any[]>([])
const nowTableNotDisableTableRow = ref<any[]>([])
const addQuestionsRef = ref<InstanceType<typeof AddQuestions>>()
const previewVal = ref(false)
const previewQuestionsRef = ref<InstanceType<typeof PreviewQuestions>>()
const selectBusinessTags = ref<number[]>()
const selectContentTags = ref<number[]>()
// 分数
const score = computed(() => {
  return allSelectDataList.value.reduce((acc, cur) => {
    return acc + cur.score
  }, 0)
})
const emits = defineEmits(['save', 'cancel', 'update:modelValue', 'close'])
const props = defineProps({
  modelValue: {
    type: Boolean
  },
  trainingData: {
    type: Object,
    default: () => {}
  },
  echoData: {
    type: Object,
    default: () => {}
  },
  id: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'selection',
    search: {
      hidden: true
    },
    selectable: (row: any) => {
      const result = nowTableNotDisableTableRow.value.findIndex((item: any) => item.id === row.id)
      return result != -1
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      type: 'selection'
    }
  },
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
    field: 'type',
    label: '题目类型',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        const business_tags = row.business_tags || []
        return (
          <>
            {business_tags.map((item: any) => {
              return (
                <ElTag type="success" class={'mr-2px'}>
                  {item.name}
                </ElTag>
              )
            })}
          </>
        )
      }
    }
  },
  {
    field: 'type',
    label: '题目类别',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        const content_tags = row.content_tags || []
        return (
          <>
            {content_tags.map((item: any) => {
              return (
                <ElTag type="success" class={'mr-2px'}>
                  {item.name}
                </ElTag>
              )
            })}
          </>
        )
      }
    }
  },

  {
    field: 'type',
    label: '题型',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        return getQuestionType(row.type)
      }
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
    field: 'title',
    label: '题目标题',
    search: {
      hidden: true
    }
  },
  {
    field: 'answers',
    label: '选项',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as QuestionItemType
          return (
            <>
              <AnswerView answerInfos={row.answers} />
            </>
          )
        }
      }
    }
  },
  {
    field: 'correct_answer',
    label: '正确答案',
    search: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as QuestionItemType
          const correctList = row.answers?.filter((item) => item.correct === 2) ?? []
          return (
            <>
              <AnswerView answerInfos={correctList} />
            </>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas) as any

const { tableRegister, tableState, tableMethods } = useTable({
  immediate: false,
  fetchDataApi: async () => {
    nowTableSelectDateList.value = []
    const { currentPage, pageSize } = tableState
    const data: any = {
      page: unref(currentPage),
      limit: unref(pageSize),
      business_tag_ids: selectBusinessTags.value?.length ? unref(selectBusinessTags) : null,
      content_tag_ids: selectContentTags.value?.length ? unref(selectContentTags) : null
    }
    const res = await getQuestionListApi({ ...data })
    return {
      list: res.data.list || [],
      total: res.data.pagination.total
    }
  }
})

const selectionChange = async () => {
  const elTableExpose = await getElTableExpose()
  const nowSelectData = elTableExpose?.getSelectionRows()
  const del = nowTableSelectDateList.value.filter((item: any) => {
    return !nowSelectData.some((item2: any) => {
      return item.id === item2.id
    })
  })
  if (del.length) {
    allSelectDataList.value = allSelectDataList.value.filter((item: any) => {
      return !del.some((item2: any) => {
        return item.id === item2.id
      })
    })
    nowTableSelectDateList.value = nowTableSelectDateList.value.filter((item: any) => {
      return !del.some((item2: any) => {
        return item.id === item2.id
      })
    })
  }
  const add = nowSelectData.filter((item: any) => {
    return !nowTableSelectDateList.value.some((item2: any) => {
      return item.id === item2.id
    })
  })
  if (add.length) {
    allSelectDataList.value = [...allSelectDataList.value, ...add]
    nowTableSelectDateList.value = [...nowTableSelectDateList.value, ...add]
  }
  // 新增：对表单的 pass_score 进行校验
  const elForm = await getElFormExpose()
  const { pass_score } = await getFormData()
  if (!pass_score) return
  elForm?.validateField('pass_score').catch((err) => {
    console.log(err)
  })
}
const initSelectDataList = async () => {
  const elTableExpose = await getElTableExpose()
  elTableExpose?.clearSelection()

  // 筛选当前禁用项
  const business_tags = treeData.value[0].children
  const content_tags = treeData.value[1].children

  nowTableNotDisableTableRow.value = dataList.value.filter((e) => {
    const { business_tags: row_business_tags, content_tags: row_content_tags } = e
    const flg1 = row_business_tags.find((item: any) => {
      const result = business_tags.find((tag: any) => tag.id == item.id)
      if (result) return true
      return false
    })
    const flg2 = row_content_tags.find((item: any) => {
      const result = content_tags.find((tag: any) => tag.id == item.id)
      if (result) return true
      return false
    })
    return flg1 && flg2
  })

  tableDate.value = dataList.value

  // 筛选当前表格选中项
  nowTableSelectDateList.value = dataList.value.filter((e) =>
    allSelectDataList.value.find((item) => e.id === item.id)
  )

  nextTick(() => {
    for (const item of nowTableSelectDateList.value) {
      elTableExpose?.toggleRowSelection(item, true)
    }
  })
}
// 保存考题
const saveQuestions = async () => {
  const result = previewQuestionsRef.value?.getTableData() || []
  allSelectDataList.value = result
  initSelectDataList()

  previewVal.value = false
}
const { getElTableExpose, getList } = tableMethods
const { setValues, getFormData, getElFormExpose } = formMethods
const { loading, dataList, currentPage, pageSize, total } = tableState

const treeData = ref<any>([])

const rules = reactive({
  pass_score: [
    required(),
    {
      validator: (_, value) => {
        if (value > score.value) {
          return new Error('通过分不能大于总分')
        }
        return true
      }
    }
  ],
  duration: [
    required(),
    {
      validator: (_, value) => {
        const time = getTimeNumber(new Date(value))
        if (time <= 0) {
          return new Error('考试时长不能为0')
        }
        return true
      }
    }
  ]
})

const schema = reactive<FormSchema[]>([
  {
    field: 'pass_score',
    component: 'Input',
    label: `设置通过分`,
    formItemProps: {
      slots: {
        default: (formModel: any) => {
          return (
            <div class="w-[100%] flex">
              <span class="text-[#666] mr-10">大于</span>
              <ElInputNumber min={0} class="flex-1" v-model={formModel.pass_score} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'duration',
    component: 'TimePicker',
    label: `考试时长`
  }
])

const add = () => {
  showAddQuestions.value = true
}

const onCheckTree = () => {
  const business_tags = []
  const content_tags = []
  const selectList = treeRef.value?.getCheckedNodes() || []
  for (let i = 0; i < unref(selectList).length; i++) {
    const item = unref(selectList)[i]
    if (item.type?.includes('business')) {
      business_tags.push(item.id)
    } else if (item.type?.includes('content')) {
      content_tags.push(item.id)
    }
  }
  selectBusinessTags.value = business_tags
  selectContentTags.value = content_tags
  getList()
}

const preview = async () => {
  previewVal.value = true
  nextTick(() => {
    previewQuestionsRef.value?.initTableData(allSelectDataList.value)
  })
}

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    if (allSelectDataList.value.length == 0) {
      ElMessage.error('请选择考题')
      return false
    }
    const { pass_score, duration } = await getFormData()

    return {
      pass_score: pass_score,
      duration: getTimeNumber(new Date(duration)) / 1000,
      question_ids: allSelectDataList.value?.map((item: any) => {
        return item.id
      }),
      questions: allSelectDataList.value.map((item: any) => {
        return {
          ...item,
          origin_id: item.id
        }
      })
    }
  } else {
    return false
  }
}

watch(
  () => dataList.value,
  (val) => {
    if (!val.length) return
    initSelectDataList()
  },
  {
    immediate: true
  }
)

const addQuestion = async () => {
  const formRef = await addQuestionsRef.value?.getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      const result = await addQuestionsRef.value?.httpAddQyuestion()
      if (result.code === 200) {
        const questionResult = await getQuestionApi({
          id: result.data.id
        })
        allSelectDataList.value.push({
          ...questionResult.data,
          origin_id: questionResult.data.id
        })
        ElMessage.success('新增题目成功')
        getList()
        showAddQuestions.value = false
      } else {
        ElMessage.error('新增题目失败')
      }
    }
  })
}

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val)
  }
})

const close = async () => {
  emits('close')
}

defineExpose({
  submit
})

onMounted(async () => {
  const result = await getDictEags()
  const { business_tags = [], content_tags = [] } = result.data || {}
  treeData.value = [
    {
      id: 'business_tags',
      label: '业务标签',
      children: business_tags.map((item: any) => {
        return {
          id: item.id,
          label: item.name,
          type: 'business'
        }
      })
    },
    {
      id: 'content_tags',
      label: '内容标签',
      children: content_tags.map((item: any) => {
        return {
          id: item.id,
          label: item.name,
          type: 'content'
        }
      })
    }
  ]

  await getList()

  if (props.id) {
    const elForm = await getElFormExpose()
    const data = {
      ...props.echoData,
      business_tag_ids: props.echoData?.business_tags?.map((item: any) => item.id),
      content_tag_ids: props.echoData?.content_tags?.map((item: any) => item.id)
    }

    setValues(data)
    elForm?.clearValidate()
    allSelectDataList.value = props.echoData?.questions || []
    initSelectDataList()
  }
})
</script>

<style lang="less" scoped>
.tree-box {
  min-width: 300px;
  padding: 2px;
  margin-right: 20px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;

  :deep(.el-tree-node__content) {
    padding: 0 20px;
  }
}

.table-box {
  display: flex;
  height: 100%;
  flex-direction: column;

  > div {
    display: flex;
    flex: 1;
    flex-direction: column;

    > :nth-child(1) {
      height: 100%;
    }
  }
}

.addQuestions {
  padding: 0;
}

.cosurm-form {
  :deep(.el-row) {
    .el-col {
      flex: none;
    }
  }
}
</style>
