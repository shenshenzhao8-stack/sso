<script setup lang="tsx">
import { reactive, ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import {
  type FormRules,
  ElInput,
  ElUpload,
  ElButton,
  ElCheckbox,
  ElImage,
  ElMessageBox,
  ElMessage,
  ElTag,
  type UploadRequestOptions,
  type UploadRawFile
} from 'element-plus'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { Table, type TableColumn } from '@/components/Table'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { useIcon } from '@/hooks/web/useIcon'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getDictEags } from '@/api/tag/index'
import {
  createQuestionApi,
  getQuestionApi,
  updateQuestionApi,
  deleteQuestionApi
} from '@/api/question/index'
import { uploadFile } from '@/api/common/index'
import { createVideoViewer } from '@/components/VideoPlayer'
import { isNumber } from '@/utils/is'
import { detailPageHasHandlePermission, getVideoFirstFrameUrl } from '@/utils'
import PlayIcon from '@/assets/imgs/play-icon.png'

let isLeave: boolean = false

const addIcon = useIcon({ icon: 'material-symbols:add' })

const { fullPath, query } = useRoute()
const { replace, push, go } = useRouter()

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues, setSchema } = formMethods
const { required } = useValidator()

const beforeUpload = (file: UploadRawFile) => {
  const { size, type } = file
  if (type === 'image/gif') {
    ElMessage.error('上传的文件格式不正确')
    return false
  }
  if (type.startsWith('image')) {
    if (size > 1024 * 1024 * 10) {
      ElMessage.error('上传的图片大小不能超过10MB')
      return false
    }
  } else if (type.startsWith('video')) {
    if (size > 1024 * 1024 * 100) {
      ElMessage.error('上传的视频大小不能超过100MB')
      return false
    }
  }
  return true
}

const httpRequest = async (
  params: UploadRequestOptions,
  type: 'form' | 'table',
  tableIndex?: number
): Promise<{ url: string }> => {
  const { file } = params
  return new Promise<{ url: string }>(async (resolve, reject) => {
    uploadLoading.value = true
    const res = await uploadFile(file)
    uploadLoading.value = false
    if (res?.length) {
      if (type === 'form') {
        formAnnex.value = res
        formAnnexType.value = file.type.startsWith('image') ? 'image' : 'video'
        formAnnexCover.value =
          formAnnexType.value === 'image' ? res : await getVideoFirstFrameUrl(res)
      } else {
        if (isNumber(tableIndex)) {
          tableDataList.value[tableIndex].annex = res
        }
      }
      resolve({
        url: res
      })
    } else {
      reject(Error('上传失败'))
    }
  })
}

const rules: FormRules = {
  business_tag_ids: [required('请选择业务标签')],
  content_tag_ids: [required('请选择内容标签')],
  title: [required('请输入题目标题')],
  type: [required('请选择题型')],
  score: [required('请选择分值')]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'business_tag_ids',
    label: '业务标签',
    component: 'Select',
    componentProps: {
      multiple: true,
      options: [],
      on: {
        clear: () => {
          all_select_business_tag_ids.value = []
          setValues({
            business_tag_ids: []
          })
        },
        change: (e: string[]) => {
          all_select_business_tag_ids.value = e
        }
      },
      slots: {
        tag: (options: any) => {
          return (
            <>
              {all_select_business_tag_ids.value.map((item) => {
                if (!item) return <></>
                const result = all_business_tags_list.value.find((e) => e.value == item)
                if (!result) return <></>
                return (
                  <ElTag
                    closable={!isDetail.value}
                    type="info"
                    onClose={() => {
                      all_select_business_tag_ids.value = all_select_business_tag_ids.value.filter(
                        (item) => item !== result.value
                      )
                      setValues({
                        business_tag_ids: all_select_business_tag_ids.value
                      })
                    }}
                  >
                    {result.label}
                  </ElTag>
                )
              })}
            </>
          )
        }
      }
    }
  },
  {
    field: 'content_tag_ids',
    label: '内容标签',
    component: 'Select',
    componentProps: {
      multiple: true,
      options: [],
      on: {
        clear: () => {
          all_select_content_tag_ids.value = []
          setValues({
            content_tag_ids: []
          })
        },
        change: (e: string[]) => {
          all_select_content_tag_ids.value = e
        }
      },
      slots: {
        tag: (options: any) => {
          return (
            <>
              {all_select_content_tag_ids.value.map((item) => {
                if (!item) return <></>
                const result = all_content_tags_list.value.find((e) => e.value == item)
                if (!result) return <></>
                return (
                  <ElTag
                    closable={!isDetail.value}
                    type="info"
                    onClose={() => {
                      all_select_content_tag_ids.value = all_select_content_tag_ids.value.filter(
                        (item) => item !== result.value
                      )
                      setValues({
                        content_tag_ids: all_select_content_tag_ids.value
                      })
                    }}
                  >
                    {result.label}
                  </ElTag>
                )
              })}
            </>
          )
        }
      }
    }
  },
  {
    field: 'title',
    label: '题目标题',
    component: 'Input',
    componentProps: {
      placeholder: '请输入题目标题'
    }
  },
  {
    field: 'type',
    label: '题型',
    value: 1,
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '单选',
          value: 1
        },
        {
          label: '多选',
          value: 2
        },
        {
          label: '问答',
          value: 3
        },
        {
          label: '判断',
          value: 4
        }
      ],
      on: {
        change: (value: number) => {
          questionType.value = value
          setDefaultOptions()
        }
      }
    }
  },
  {
    field: 'annex',
    component: 'Upload',
    label: '上传附件',
    componentProps: {
      action: '#',
      httpRequest: (params: UploadRequestOptions) => {
        return httpRequest(params, 'form')
      },
      beforeUpload,
      accept: 'image/*,video/*',
      showFileList: false,
      slots: {
        default: () => (
          <>
            <div class="flex">
              {!formAnnex.value?.length ? (
                ''
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {formAnnexType.value === 'video' ? (
                    <div class="pos-relative inline-block mr-10px">
                      <ElImage class="h-[100px]" src={formAnnexCover.value} fit="cover" lazy />
                      <img
                        src={PlayIcon}
                        class="h-[30px] w-[30px] pos-absolute left-50% top-50% transform-translate--50%"
                        onClick={() => {
                          createVideoViewer({
                            url: formAnnex.value
                          })
                        }}
                      />
                    </div>
                  ) : formAnnexType.value === 'image' ? (
                    <ElImage
                      class="h-[100px] mr-10px"
                      src={formAnnexCover.value}
                      fit="cover"
                      lazy
                      preview-src-list={[formAnnexCover.value]}
                      preview-teleported
                    />
                  ) : (
                    ''
                  )}
                </div>
              )}
              {isDetail.value ? (
                ''
              ) : (
                <ElButton class="self-end mb-10px" type="primary">
                  点击上传
                </ElButton>
              )}
            </div>
          </>
        ),
        tip: () => (
          <div class="el-upload__tip">
            支持上传png、jpg、mp4、avi等图片或视频附件，视频大小不超过100mb，图片大小不超过10mb
          </div>
        )
      }
    }
  },
  {
    field: 'score',
    label: '分值',
    value: 1,
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '0分',
          value: 0
        },
        {
          label: '1分',
          value: 1
        },
        {
          label: '2分',
          value: 2
        },
        {
          label: '5分',
          value: 5
        },
        {
          label: '10分',
          value: 10
        },
        {
          label: '15分',
          value: 15
        },
        {
          label: '20分',
          value: 20
        }
      ]
    }
  }
])

const columns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'number',
    label: '选项',
    width: 80,
    slots: {
      default: (data: any) => {
        return (
          <>
            <ElInput v-model={data.row.number} disabled={isDetail.value} />
          </>
        )
      }
    }
  },
  {
    field: 'answer',
    label: '内容',
    slots: {
      default: (data: any) => {
        return (
          <>
            <ElInput v-model={data.row.answer} disabled={isDetail.value} />
          </>
        )
      }
    }
  },
  {
    field: 'annex',
    label: '上传图片',
    width: 200,
    slots: {
      default: (data: any) => {
        return (
          <>
            <div class="flex items-center">
              {!data.row.annex?.length ? (
                ''
              ) : (
                <ElImage
                  class="h-[30px] mr-10px"
                  src={data.row.annex}
                  fit="cover"
                  lazy
                  preview-src-list={[data.row.annex]}
                  preview-teleported
                />
              )}
              <ElUpload
                class="flex"
                action="#"
                httpRequest={(params: UploadRequestOptions) => {
                  return httpRequest(params, 'table', data.$index)
                }}
                accept="image/*"
                showFileList={false}
              >
                {isDetail.value ? '' : <ElButton type="primary">点击上传</ElButton>}
              </ElUpload>
            </div>
          </>
        )
      }
    }
  },
  {
    field: 'correct',
    label: '正确答案',
    width: 120,
    slots: {
      default: (data: any) => {
        return (
          <>
            <div class="flex items-center">
              <ElCheckbox
                disabled={isDetail.value}
                v-model={data.row.correct}
                onChange={() => {
                  setCorrentAnswer(data.$index, data.row.correct)
                }}
              />
              <span class="ml-10px">正确答案</span>
            </div>
          </>
        )
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    width: 100,
    slots: {
      default: (data: any) => {
        return (
          <>
            {isDetail.value ? (
              ''
            ) : (
              <BaseButton type="danger" onClick={() => deleteOptionAction(data)}>
                删除
              </BaseButton>
            )}
          </>
        )
      }
    }
  }
])

const isAdd = ref(true)
const isDetail = ref(false)
const questionType = ref(1)
const tableDataList = ref<any[]>([])
const formAnnex = ref()
const formAnnexCover = ref('')
const formAnnexType = ref('')
const uploadLoading = ref(false)
const all_content_tags_list = ref<any[]>([])
const all_select_content_tag_ids = ref<any[]>([])
const all_business_tags_list = ref<any[]>([])
const all_select_business_tag_ids = ref<any[]>([])
const questionDetail = ref<any>()
const optionNum = ref([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
])

onMounted(async () => {
  isAdd.value = fullPath.includes('add')
  isDetail.value = fullPath.includes('detail')
  if (isAdd.value) {
    setDefaultOptions()
  } else {
    await getQuestionDetail(Number(query.id))
  }
  setTags()
})

const setTags = async () => {
  const result = await getDictEags()
  const { business_tags = [], content_tags = [] } = result.data || {}

  const business = (questionDetail.value?.business_tags || [])
    .filter((item: any) => {
      return !business_tags.find((business_tag: any) => business_tag.id === item.id)
    })
    .map((item: any) => {
      return { ...item, disabled: true }
    })
  const content = (questionDetail.value?.content_tags || [])
    .filter((item: any) => {
      return !content_tags.find((content_tag: any) => content_tag.id === item.id)
    })
    .map((item: any) => {
      return { ...item, disabled: true }
    })
  const content_tags_list = [...content_tags, ...content].map((item: any) => {
    return {
      label: item.name,
      value: item.id,
      disabled: item.disabled
    }
  })

  all_content_tags_list.value = content_tags_list
  const business_tags_list = [...business_tags, ...business].map((item: any) => {
    return {
      label: item.name,
      value: item.id,
      disabled: item.disabled
    }
  })
  all_business_tags_list.value = business_tags_list

  setSchema([
    {
      field: 'business_tag_ids',
      path: 'componentProps.options',
      value: business_tags_list
    }
  ])

  setSchema([
    {
      field: 'content_tag_ids',
      path: 'componentProps.options',
      value: content_tags_list
    }
  ])
}

const setCorrentAnswer = (current_index: number, is_correct: boolean) => {
  if (is_correct && (questionType.value === 1 || questionType.value === 4)) {
    tableDataList.value.forEach((item, index) => {
      if (index === current_index) {
        item.correct = true
      } else {
        item.correct = false
      }
    })
  }
}

const setDefaultOptions = () => {
  tableDataList.value = []
  if (questionType.value === 3) {
    tableDataList.value.push({
      number: '',
      answer: '',
      annex: '',
      correct: true
    })
  } else {
    for (let i = 0; i < (questionType.value === 4 ? 2 : 4); i++) {
      tableDataList.value.push({
        number: optionNum.value[i],
        answer: '',
        annex: '',
        correct: false
      })
    }
  }
}

const addOptionAction = () => {
  tableDataList.value.push({
    number: optionNum.value[tableDataList.value.length] ?? '',
    answer: '',
    annex: '',
    correct: false
  })
}

const getQuestionDetail = async (id: number) => {
  const res = await getQuestionApi({ id })
  if (res.code === 200) {
    questionDetail.value = res.data
    formAnnex.value = res.data.annex
    formAnnexType.value = res.data.annex_type
    questionType.value = res.data.type ?? 1
    if (formAnnexType.value === 'image') {
      formAnnexCover.value = res.data.annex
    } else if (formAnnexType.value === 'video') {
      getVideoFirstFrameUrl(res.data.annex)
        .then((url) => {
          formAnnexCover.value = url
        })
        .catch(() => {
          formAnnexCover.value = ''
          ElMessage.error('获取视频封面失败')
        })
    }
    setValues({
      business_tag_ids: res.data.business_tags.map((item) => item.id),
      content_tag_ids: res.data.content_tags.map((item) => item.id),
      title: res.data.title,
      type: res.data.type,
      score: res.data.score
    })
    all_select_business_tag_ids.value = res.data.business_tags.map((item) => item.id)
    all_select_content_tag_ids.value = res.data.content_tags.map((item) => item.id)
    if (questionType.value === 3) {
      tableDataList.value = [
        {
          number: '',
          answer: res.data.answers[0]?.answer,
          annex: '',
          correct: res.data.answers[0]?.correct === 2 ? true : false
        }
      ]
    } else {
      tableDataList.value = res.data.answers.map((item: any) => {
        return {
          number: item.number,
          answer: item.answer,
          annex: item.annex,
          correct: item.correct === 2 ? true : false
        }
      })
    }
  }
}

const deleteOptionAction = (row: any) => {
  ElMessageBox.confirm('是否删除所选中数据？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableDataList.value.splice(row.$index, 1)
    tableDataList.value.forEach((item, index) => {
      item.number = optionNum.value[index]
    })
  })
}

/**
 * 新增
 * @param params
 */
const httpAddQyuestion = async (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const formData = await getFormData<any>()
    const { annex, ...rest } = formData
    if (questionType.value !== 3 && tableDataList.value.find((item) => item.number?.length === 0)) {
      ElMessage.error('选项不能为空')
      return
    }
    if (
      questionType.value !== 3 &&
      tableDataList.value.find(
        (item) => (item.answer ?? '').length === 0 && (item.annex ?? '').length === 0
      )
    ) {
      ElMessage.error('内容和图片不能都为空')
      return
    }
    if (questionType.value !== 3 && !tableDataList.value.find((item) => item.correct)) {
      ElMessage.error('请设置正确答案')
      return
    }
    const answers = tableDataList.value.map((item: any) => {
      return {
        number: item.number,
        answer: item.answer,
        annex: item.annex,
        correct: item.correct ? 2 : 1
      }
    })
    const res = await createQuestionApi({
      ...rest,
      annex_type: formAnnexType.value,
      annex: formAnnex.value,
      answers
    })
    resolve(res)
  })
}

/**
 * 更新
 * @param params
 */
const httpUpdateQuestion = async (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const formData = await getFormData<any>()
    const { annex, ...rest } = formData
    if (questionType.value !== 3 && tableDataList.value.find((item) => item.number?.length === 0)) {
      ElMessage.error('选项不能为空')
      return
    }
    if (
      questionType.value !== 3 &&
      tableDataList.value.find(
        (item) => (item.answer ?? '').length === 0 && (item.annex ?? '').length === 0
      )
    ) {
      ElMessage.error('内容和图片不能都为空')
      return
    }
    if (questionType.value !== 3 && !tableDataList.value.find((item) => item.correct)) {
      ElMessage.error('请设置正确答案')
      return
    }
    const answers = tableDataList.value.map((item: any) => {
      return {
        number: item.number,
        answer: item.answer,
        annex: item.annex,
        correct: item.correct ? 2 : 1
      }
    })
    const res = await updateQuestionApi({
      id: Number(query.id),
      ...rest,
      annex_type: formAnnexType.value,
      annex: formAnnex.value,
      answers
    })
    resolve(res)
  })
}

const submitQuestion = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      if (isAdd.value) {
        const res = await httpAddQyuestion()
        if (res.code === 200) {
          ElMessage.success('新增题目成功')
          isLeave = true
          replace('/question-management/list')
        } else {
          ElMessage.error('新增题目失败')
        }
      } else {
        const res = await httpUpdateQuestion()
        if (res.code === 200) {
          ElMessage.success('更新题目成功')
          isLeave = true
          replace('/question-management/list')
        } else {
          ElMessage.error('更新题目失败')
        }
      }
    }
  })
}

const editAction = () => {
  push({
    path: '/question-management/edit',
    query: {
      id: query.id
    }
  })
}

const cancelAction = () => {
  replace('/question-management/list')
}

const deleteAction = () => {
  ElMessageBox.confirm('是否删除该题目？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteQuestionApi({ id: Number(query.id) })
    if (res.code === 200) {
      replace('/question-management/list')
    } else {
      ElMessage.error('删除失败')
    }
  })
}

onBeforeRouteLeave((to, from, next) => {
  if (isDetail.value || isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('题目还未保存，是否取消？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    next()
  })
})

defineExpose({
  httpAddQyuestion,
  getElFormExpose
})
</script>

<template>
  <ContentWrap
    class="min-h-[var(--view-context-height)] pl-150px pr-150px"
    v-loading="uploadLoading"
  >
    <slot name="header">
      <BaseButton class="pos-absolute left-40px top-40px" @click="go(-1)"> 返回 </BaseButton>
    </slot>
    <div class="min-h-[calc(var(--view-context-height)-94px)]">
      <div class="text-align-center font-bold">
        {{ isAdd ? '新增题目' : isDetail ? '题目详情' : '编辑题目' }}
      </div>
      <div class="ml-10px mt-30px mb-30px">题目信息</div>
      <Form :schema="schema" :rules="rules" @register="formRegister" :disabled="isDetail" />
      <div class="pl-10px pr-10px" v-if="questionType !== 3">
        <Table max-height="330px" :columns="columns" :data="tableDataList" />
        <div class="mt-20px mb-20px flex justify-center">
          <BaseButton v-if="!isDetail" type="primary" :icon="addIcon" @click="addOptionAction"
            >添加选项</BaseButton
          >
        </div>
      </div>
      <div class="pl-10px pr-10px" v-else>
        <div class="mb-20px">正确答案</div>
        <ElInput
          :disabled="isDetail"
          v-model="tableDataList[0].answer"
          :rows="12"
          type="textarea"
          placeholder="请输入正确的答案"
        />
      </div>
    </div>
    <slot name="footer">
      <div
        v-if="!isDetail || detailPageHasHandlePermission(12)"
        class="h-[52px] pt-20px border-t-1px border-t-solid border-t-[#e4e4e4]"
      >
        <BaseButton v-if="!isDetail" type="primary" @click="submitQuestion">{{
          isAdd ? '发布题目' : '保存'
        }}</BaseButton>
        <BaseButton v-else type="primary" @click="editAction">{{ '编辑题目' }}</BaseButton>
        <BaseButton v-if="!isDetail" type="primary" @click="cancelAction">{{ '取消' }}</BaseButton>
        <BaseButton v-else type="danger" @click="deleteAction">{{ '删除' }}</BaseButton>
      </div>
    </slot>
  </ContentWrap>
</template>
