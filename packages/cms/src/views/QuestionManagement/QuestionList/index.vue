<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import { useRouter } from 'vue-router'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { getDictEags } from '@/api/tag/index'
import {
  getQuestionListApi,
  deleteQuestionApi,
  getQuestionFileTemplateApi,
  batchImportQuestionsApi
} from '@/api/question/index'
import type { QuestionItemType } from '@/api/question/type'
import { ElMessage, type UploadRequestOptions } from 'element-plus'
import { formatTime } from '@/utils/index'
import { AnswerView } from '@/components/AnswerView'
import { Permission } from '@/components/Permission'
import * as XLSX from 'xlsx'
import { isNumber } from '@/utils/is'

const { push } = useRouter()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getQuestionListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data?.list ?? [],
      total: res.data?.pagination?.total ?? 0
    }
  },
  fetchDelApi: async () => {
    if (!currentRow.value?.id) {
      ElMessage.error('删除失败')
      return false
    }
    const res = await deleteQuestionApi({ id: currentRow.value?.id })
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
    field: 'business_tags',
    label: '业务标签',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        placeholder: '请选择业务标签',
        multiple: true
      },
      optionApi: async () => {
        const res = await getDictEags()
        return (
          res.data?.business_tags?.map((item: any) => {
            return {
              label: item.name,
              value: item.id
            }
          }) ?? []
        )
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as QuestionItemType
          return <>{row.business_tags?.map((item) => item.name).join('，') ?? '-'}</>
        }
      }
    }
  },
  {
    field: 'content_tags',
    label: '内容标签',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        placeholder: '请选择内容标签',
        multiple: true
      },
      optionApi: async () => {
        const res = await getDictEags()
        return (
          res.data?.content_tags?.map((item: any) => {
            return {
              label: item.name,
              value: item.id
            }
          }) ?? []
        )
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as QuestionItemType
          return <>{row.content_tags?.map((item) => item.name).join('，') ?? '-'}</>
        }
      }
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
    field: 'type',
    label: '题型',
    search: {
      component: 'Select',
      componentProps: {
        style: {
          width: '150px'
        },
        placeholder: '请选择题型'
      },
      optionApi: async () => {
        return [
          { label: '单选题', value: '1' },
          { label: '多选题', value: '2' },
          { label: '问答题', value: '3' },
          { label: '判断题', value: '4' }
        ]
      }
    },
    table: {
      slots: {
        default: (data: any) => {
          const row = data.row as QuestionItemType
          let typeStr = '-'
          if (row.type === 1) {
            typeStr = '单选题'
          } else if (row.type === 2) {
            typeStr = '多选题'
          } else if (row.type === 3) {
            typeStr = '问答题'
          } else if (row.type === 4) {
            typeStr = '判断题'
          }
          return <>{typeStr}</>
        }
      }
    }
  },
  {
    field: 'answers',
    label: '选项',
    search: {
      hidden: true
    },
    table: {
      width: 300,
      slots: {
        default: (data: any) => {
          const row = data.row as QuestionItemType
          return (
            <>
              <AnswerView answerInfos={row.answers ?? []} />
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
  },
  {
    field: 'score',
    label: '分值',
    search: {
      hidden: true
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
        const row = data.row as QuestionItemType
        return <>{formatTime(row.updated_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
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
          const row = data.row as QuestionItemType
          return (
            <>
              <Permission permission="PUT">
                <div
                  class="inline mr-10px"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <BaseButton type="primary" onClick={() => editAction(row)}>
                    编辑
                  </BaseButton>
                </div>
              </Permission>
              <Permission permission="GET">
                <div
                  class="inline mr-10px"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <BaseButton type="primary" onClick={() => detailAction(row)}>
                    查看
                  </BaseButton>
                </div>
              </Permission>
              <Permission permission="DELETE">
                <div
                  class="inline"
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
              </Permission>
            </>
          )
        }
      }
    }
  }
])
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const delLoading = ref(false)
const searchParams = ref({})
const currentRow = ref<QuestionItemType>()

const searchAction = (params: any) => {
  searchParams.value = {
    business_tag_ids: params.business_tags?.length ? params.business_tags : undefined,
    content_tag_ids: params.content_tags?.length ? params.content_tags : undefined,
    type: params.type ? Number(params.type) : undefined
  }
  getList()
}

const addAction = () => {
  push('/question-management/add')
}

const detailAction = (row: QuestionItemType) => {
  push({
    path: '/question-management/detail',
    query: {
      id: row.id
    }
  })
}

const editAction = (row: QuestionItemType) => {
  push({
    path: '/question-management/edit',
    query: {
      id: row.id
    }
  })
}

const deleteAction = async (row: QuestionItemType) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}

const downloadTemplate = async () => {
  const res = await getQuestionFileTemplateApi()
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = '批量导入试题模板.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}

const uploadFile = (params: UploadRequestOptions): Promise<void> => {
  const { file } = params
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = async function (e: any) {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 1 })
          let questions = jsonData.filter(
            (item: any) => item && item !== 'undefined' && item.length !== 0
          )
          questions = questions.filter((item: any) => {
            return item.some((sub_item: any, index: number) => {
              return index < 15 && sub_item?.toString().trim().length
            })
          })
          const newQuestions = [...new Set(questions)]
          await batchImportQuestions(newQuestions)
          resolve()
        } catch (error: any) {
          ElMessage.error(error.message || '文件解析失败')
          reject(error)
        }
      }
      reader.onerror = (error) => {
        ElMessage.error('文件读取失败')
        reject(error)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '文件获取失败')
      reject(error)
    }
  })
}

const beforeAvatarUpload = (file: any) => {
  const excelist = ['xls', 'xlsx']
  const list = file.name.split('.')
  if (!excelist.includes(list[list.length - 1])) {
    ElMessage.error('只支持xls、xlsx格式')
    return false
  }
  return true
}

const handleExceedOne = () => {
  ElMessage.warning('最多可上传一个文件!')
}

const batchImportQuestions = async (questions: any[]) => {
  if (!questions.length) {
    ElMessage.error('上传的文件中没有有效的试题')
    return
  }
  const questionItems = []
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    if (!question[13]?.toString().length) {
      ElMessage.error('试题的业务标签不能为空')
      return
    }
    question[13] = question[13].toString()

    if (!question[14]?.toString().length) {
      ElMessage.error('试题的内容标签不能为空')
      return
    }
    question[14] = question[14].toString()

    if (!question[0]?.toString().length) {
      ElMessage.error('试题的标题不能为空')
      return
    }
    // if (question[0].toString().length > 50) {
    //   ElMessage.error('试题的标题不能超过50个字符')
    //   return
    // }
    question[0] = question[0].toString()

    if (!question[12]?.toString().length) {
      ElMessage.error('试题的类型不能为空')
      return
    }
    question[12] = question[12].toString()

    if (!isNumber(question[11])) {
      ElMessage.error('试题的分值不是有效的数字')
      return
    }
    question[11] = +question[11]

    const answersItems = []
    const optionTags = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    if (question[12] === '问答题') {
      answersItems.push({
        answer: question[9]?.toString() ?? '',
        correct: 2
      })
    } else {
      for (let j = 1; j <= 8; j++) {
        if (!question[j]?.toString().length) {
          continue
        }
        // if (question[j].toString().length > 20) {
        //   ElMessage.error(`试题的选项不能超过20个字符`)
        //   return
        // }
        answersItems.push({
          answer: question[j].toString(),
          correct: (question[10]?.toString() ?? '').includes(optionTags[j - 1]) ? 2 : 1,
          number: optionTags[j - 1]
        })
      }
    }
    if (!answersItems.length) {
      ElMessage.error('试题至少有一个有效的答案选项')
      return
    }
    if (!answersItems.find((item) => item.correct === 2)) {
      ElMessage.error('试题需要配置正确选项')
      return
    }

    const questionItem = {
      business_tags: question[13].split('，'),
      content_tags: question[14].split('，'),
      title: question[0],
      type: question[12],
      score: question[11],
      answers: answersItems
    }
    questionItems.push(questionItem)
  }
  const res = await batchImportQuestionsApi({ items: questionItems })
  if (res.code === 200) {
    getList()
    ElMessage.success('试题导入成功')
  } else if (res.code === 200305) {
    ElMessage.error('试题导入失败，业务标签不存在')
  } else if (res.code === 200306) {
    ElMessage.error('试题导入失败，内容标签不存在')
  } else {
    ElMessage.error('试题导入失败，请检查文件中的试题是否配置正确')
  }
}
</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="searchAction" @reset="searchAction" />
    <div class="mb-10px flex">
      <Permission permission="POST">
        <BaseButton class="mr-10px" type="primary" @click="addAction">新增</BaseButton>
      </Permission>
      <ElUpload
        action="#"
        :show-file-list="false"
        :http-request="uploadFile"
        :before-upload="beforeAvatarUpload"
        :on-exceed="handleExceedOne"
      >
        <Permission permission="POST">
          <BaseButton type="primary">批量导入试题</BaseButton>
        </Permission>
      </ElUpload>
      <Permission permission="POST">
        <BaseButton class="ml-a mr-0" type="primary" @click="downloadTemplate">模版下载</BaseButton>
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
      :row-style="
        () => {
          return {
            cursor: 'pointer'
          }
        }
      "
      @register="tableRegister"
      @rowClick="detailAction"
    />
  </ContentWrap>
</template>
