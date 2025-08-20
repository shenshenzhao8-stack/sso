<template>
  <div class="h-100% flex flex-col">
    <Form
      class="cosurm-form"
      :rules="rules"
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
    <ElDivider />
    <div class="flex justify-between flex-1">
      <div class="tree-box">
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
      </div>
      <div class="flex-1 table-box">
        <Table
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
    <div class="m-t10px" v-if="!disabled">
      <BaseButton type="primary" :loading="btnLoading" @click="save">保存 </BaseButton>
      <BaseButton @click="cancel">取消</BaseButton>
    </div>
    <ElDrawer v-model="previewVal" title="预览考题" size="80vw" :max-height="500">
      <PreviewQuestions ref="previewQuestionsRef" />
      <template #footer>
        <BaseButton type="primary" @click="saveQuestions"> 更新 </BaseButton>
        <BaseButton @click="previewVal = false">关闭</BaseButton>
      </template>
    </ElDrawer>
  </div>

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
import { ElInputNumber, ElDivider, ElTree, ElDrawer, ElTag, ElMessage } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { BaseButton } from '@/components/Button'
import { getQuestionType, getTimeNumber } from '@/utils/index'
import AddQuestions from '@/views/QuestionManagement/AddQuestion/index.vue'
const { formRegister, formMethods } = useForm()
const { required } = useValidator()
import { useTable } from '@/hooks/web/useTable'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { Dialog } from '@/components/Dialog'
import PreviewQuestions from './PreviewQuestions.vue'
import { getDictEags } from '@/api/tag'
import { getQuestionApi, getQuestionListApi } from '@/api/question'
import { useRouter } from 'vue-router'
import { AnswerView } from '@/components/AnswerView'
import type { QuestionItemType } from '@/api/question/type'

const showAddQuestions = ref<boolean>(false)
const oldQuestionIds = ref<string[]>([])
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

const emits = defineEmits(['save', 'cancel'])
const props = defineProps({
  echoData: {
    type: Object,
    default: () => {}
  },
  btnLoading: {
    type: Boolean,
    default: false
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

const { allSchemas } = useCrudSchemas(crudSchemas)

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
  nowTableSelectDateList.value = tableDate.value.filter((e) =>
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

const treeData = ref<any>()

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
            <div class="flex" style="white-space: nowrap;">
              <span class="text-[#666] mr-10">大于</span>
              <div class="w-200px">
                <ElInputNumber style={{ width: '100%' }} min={0} v-model={formModel.pass_score} />
              </div>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'duration',
    component: 'TimePicker',
    componentProps: {
      style: {
        width: '200px'
      }
    },
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

const save = async () => {
  emits('save')
}

const cancel = () => {
  emits('cancel')
}

const getQuestionIds = () => {
  // 逻辑 id 没有改变传null id 改变后传改变后id
  // props.echoData.questions  id 为拷贝后新生成的id  origin_id 为原始id 用于表格回显
  // 获取http 请求回来的id
  const lastQuestionIds = props.echoData?.questions?.map((item: any) => item.origin_id) || []
  const newQuestionIds = allSelectDataList.value?.map((item: any) => {
    return item.id
  })
  let questionIds: string[] | null = null
  //  如果跟原始id 相同 则不修改
  if (lastQuestionIds.length == newQuestionIds.length) {
    let flg = true
    // 判断两个数组是否相同
    for (let i = 0; i < newQuestionIds.length; i++) {
      // 找出原始题目id  origin_id为原始id 题目是拷贝 故需要拿 origin_id 提交后 产生新id表格
      if (newQuestionIds[i] !== lastQuestionIds[i]) {
        flg = false
        break
      }
    }
    if (!flg) questionIds = newQuestionIds
  } else {
    questionIds = newQuestionIds
  }
  return questionIds
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
    const questionIds = getQuestionIds()
    const new_duration = getTimeNumber(new Date(duration)) / 1000
    if (new_duration == 0) {
      ElMessage.error('请重新填写考试时间')
      return false
    }
    return {
      pass_score: pass_score,
      duration: new_duration,
      question_ids: questionIds
    }
  } else {
    return false
  }
}

watch(
  () => props.echoData,
  (echoData) => {
    if (!echoData) return

    const data = {
      ...echoData,
      business_tag_ids: echoData.business_tags?.map((item: any) => item.id),
      content_tag_ids: echoData.content_tags?.map((item: any) => item.id)
    }
    oldQuestionIds.value = echoData.questions?.map((item: any) => {
      return item.origin_id
    })
    setValues(data)
    allSelectDataList.value = echoData.questions?.map((item: any) => {
      return {
        ...item,
        id: item.origin_id
      }
    })
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  () => dataList.value,
  () => {
    if (dataList.value.length == 0) return
    setTimeout(async () => {
      initSelectDataList()
    }, 200)
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
        ElMessage.success('新增题目成功')
        const questionResult = await getQuestionApi({
          id: result.data.id
        })
        allSelectDataList.value.push({
          ...questionResult.data,
          origin_id: questionResult.data.id
        })
        getList()
        showAddQuestions.value = false
      } else {
        ElMessage.error('新增题目失败')
      }
    }
  })
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
