<template>
  <div class="preview-questions">
    <div class="flex items-center text-14px text-[#666] mb-10px">
      <div>已选择：{{ localTableData.length }} 道题</div>
      <div class="ml-50px">总分值：{{ score }}分</div>
    </div>
    <Table
      :columns="allSchemas.tableColumns"
      :data="localTableData"
      :show-overflow-tooltip="false"
    />
  </div>
</template>

<script setup lang="tsx">
import { reactive, ref, computed, nextTick } from 'vue'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { ElMessageBox, ElTag } from 'element-plus'
import { getQuestionType } from '@/utils'
import { cloneDeep } from 'lodash-es'
import type { QuestionItemType } from '@/api/question/type'
import { AnswerView } from '@/components/AnswerView'

// 创建本地数据副本
const localTableData = ref<any[]>([])
// 分数
const score = computed(() => {
  return localTableData.value
    .filter((item) => !item.isDel)
    .reduce((acc, cur) => {
      return acc + cur.score
    }, 0)
})
// 初始化表格数据方法
const initTableData = (data: any[]) => {
  localTableData.value = []
  nextTick(() => {
    localTableData.value = cloneDeep([...(data || [])])
  })
}

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
    label: '操作',
    width: '250px',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row, $index }: any) => (
        <>
          <BaseButton
            type="primary"
            link
            disabled={$index === 0}
            onClick={() => handleMove($index, 'up')}
          >
            上移
          </BaseButton>
          <BaseButton
            type="primary"
            link
            disabled={$index === localTableData.value.length - 1}
            onClick={() => handleMove($index, 'down')}
          >
            下移
          </BaseButton>

          {row.isDel ? (
            <BaseButton type="primary" link onClick={() => (row.isDel = false)}>
              恢复
            </BaseButton>
          ) : (
            <BaseButton type="danger" link onClick={() => delData(row)}>
              删除
            </BaseButton>
          )}
        </>
      )
    }
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

// 取当前表格数据的方法
const getTableData = () => {
  return localTableData.value.filter((item) => !item.isDel)
}

// 添加移动方法
const handleMove = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= localTableData.value.length) return

  // 交换位置
  const temp = localTableData.value[index]
  localTableData.value[index] = localTableData.value[newIndex]
  localTableData.value[newIndex] = temp
}

const delData = async (row: any | null) => {
  ElMessageBox.confirm('确定要删除这道题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      row.isDel = true
    })
    .catch(() => {})
}

// 暴露方法给父组件
defineExpose({
  getTableData,
  initTableData
})
</script>
