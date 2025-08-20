<template>
  <ElDrawer v-model:model-value="dialogVisible" size="50vw" @close="close">
    <template #header>
      <div class="text-center font-800">{{ name }}（分值 {{ score }})</div>
    </template>

    <div class="flex flex-col">
      <component :is="renderQuestions" />
    </div>
  </ElDrawer>
</template>

<script setup lang="tsx">
import { ElDrawer, ElButton, ElMessage, ElImage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { getExamResult, changeExamResult } from '@/api/examination'
import { useMenuStore } from '@/stores/menuView'
import {
  RadioQuestion,
  CheckboxQuestion,
  JudgeQuestion,
  EssayQuestion
} from '@/components/Question/index'
import { useUserStore } from '@/stores/user'
const props = defineProps({
  modelValue: {
    type: Boolean
  },
  name: {
    type: String
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

const examId = ref<string>('')
const menuStore = useMenuStore()
const disabled = ref<boolean>(false)
const emit = defineEmits(['update:modelValue', 'close'])
const questionsOptions = ref([])
const score = ref<number>(0)
const userStore = useUserStore()
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const hasPut = computed(() => {
  const list = menuStore.allMenuRouter.find((item) => item.meta.id == props.defalutMenuId)
  const result = list?.meta?.actions || []
  const isCreateUser = userStore.userInfo?.id && userStore.userInfo?.id == props.createUserId
  const isAdmin = userStore.userInfo?.id && userStore.userInfo?.id == 1

  return (result as string[]).includes('PUT') && (isCreateUser || isAdmin)
})
const getHandBtn = (row: any) => {
  if (!hasPut.value) {
    return <></>
  }
  return (
    <div class={'mt-10px'}>
      <ElButton
        type="success"
        round
        disabled={disabled.value}
        onClick={() => updateExamResult(row.exam_question_result_id, 1)}
      >
        正确
      </ElButton>

      <ElButton
        type="danger"
        round
        disabled={disabled.value}
        onClick={() => updateExamResult(row.exam_question_result_id, 2)}
      >
        错误
      </ElButton>
    </div>
  )
}

const updateExamResult = async (id: string, judge: number) => {
  const data = {
    id: examId.value,
    exam_questions: [
      {
        id,
        judge
      }
    ]
  }
  const res = await changeExamResult(data)
  if (res.code === 200) {
    ElMessage.success('操作成功')
    score.value = res.data.score
  }
}

const getItem = (data: any) => {
  return (
    <div class="flex items-center">
      <span>{(data.number ?? '') + (data.number ? '：' : '') + (data.answer ?? '')}</span>
      {data.annex ? (
        <ElImage
          class="h-[40px] w-[40px] mr-10px"
          src={data.annex}
          fit="cover"
          preview-src-list={[data.annex]}
          preview-teleported
        />
      ) : (
        <></>
      )}
    </div>
  )
}

const getQuestions = (item: any, index: number) => {
  const props = {
    title: item.title,
    disabled: true
  }

  switch (item.type) {
    case 1:
      return (
        <RadioQuestion {...props} options={item.answers} v-model={item.user_select}>
          {{
            default: ({ data }: any) => getItem(data)
          }}
        </RadioQuestion>
      )
    case 2:
      return (
        <CheckboxQuestion {...props} options={item.answers} v-model={item.user_select}>
          {{
            default: ({ data }: any) => {
              return getItem(data)
            }
          }}
        </CheckboxQuestion>
      )
    case 4:
      return (
        <JudgeQuestion options={item.answers} v-model={item.user_select} {...props}>
          {{
            default: ({ data }: any) => getItem(data)
          }}
        </JudgeQuestion>
      )
    case 3:
      return <EssayQuestion v-model={item.user_select} {...props} />
    default:
      return null
  }
}

const renderQuestions = () => {
  return (
    <div class="question-list">
      {questionsOptions.value.map((item: any, index) => {
        return (
          <div class="m-t50px">
            {getQuestions(item, index)}
            <div style="m-t10px">
              <span> 正确答案：</span>
              <span>{item.correct_answer}</span>
            </div>
            {getHandBtn(item)}
          </div>
        )
      })}
    </div>
  )
}

const init = async (id: string) => {
  examId.value = id
  const result = await getExamResult({ id })
  if (result.code === 200) {
    const { questions = [] } = result.data || {}
    score.value = result.data.score
    questionsOptions.value = questions.map((item: any) => {
      item.answers = item.answers.map((item: any) => {
        return {
          ...item,
          value: item.id + ''
        }
      })
      item.correct_answer = item.answers
        .filter((e: any) => e.correct == 2)
        .map((e: any) => {
          if (item.type == 3) {
            return (e.answer || '') + ''
          }
          return e.number + ''
        })

      item.user_select = item.answers.filter((e: any) => e.selected == 1).map((e: any) => e.id + '')
      if (item.type == 2) {
        item.user_select = [...item.user_select]
      } else if (item.type == 3) {
        item.user_select = item.answers.map((e: any) => e.user_answer).join('')
      } else {
        item.user_select = item.user_select.join('')
      }
      return item
    })
  } else {
    ElMessage.error(result.msg)
  }
}

const close = () => {
  emit('close')
}

defineExpose({
  init
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
  },
  {
    immediate: true
  }
)
</script>
<style lang="less" scoped>
:deep(img) {
  -webkit-user-drag: none;
}
</style>
