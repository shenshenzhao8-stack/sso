<script setup lang="ts">
import BasicInformation from './components/BasicInformation.vue'
import ExamQuestionConfiguration from './components/ExamQuestionConfiguration.vue'
import ExamSituation from './components/ExamSituation.vue'
import TrainingContent from './components/TrainingContent.vue'
import LookTrainingContent from './components/LookTrainingContent.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import dayjs from 'dayjs'
const { getStorage, setStorage, removeStorage } = useStorage('localStorage')
import { createTraining, updateTraining, getDetailTraining } from '@/api/training'
import { useStorage } from '@/hooks/web/useStorage'
import { allPropertiesAreFalse } from '@/utils'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menuView'

let isLeave: boolean = false
const userStore = useUserStore()
const menuStore = useMenuStore()
const isAddSucess = ref(false)
// 是否需要考试
const is_need_exam = ref<boolean>(true)
const loading = ref(false)
const route = useRoute()
const pageLoading = ref(true)
const echoData = ref<any>()
const id: string = (route?.query?.id ? route?.query?.id + '' : '') as string
const activeName = ref('first')
const { push, go, back } = useRouter()

const basicInformationRef = ref<ComponentRef<typeof BasicInformation>>()
const trainingContentRef = ref<ComponentRef<typeof TrainingContent>>()
const examQuestionConfigurationRef = ref<ComponentRef<typeof ExamQuestionConfiguration>>()

const save = async () => {
  const basicForm = await basicInformationRef.value?.submit()

  if (!basicForm) {
    ElMessage.error('请填写基础信息必填项')
    return
  }
  const examQuestionConfiguration = examQuestionConfigurationRef.value?.submit()
  if (!examQuestionConfiguration || examQuestionConfiguration.length == 0) {
    return ElMessage.error('请添加培训内容')
  }

  let flg = false
  for (const item of examQuestionConfiguration) {
    if (!is_need_exam.value) item.exam = null
    if (is_need_exam.value && !flg && item.exam?.question_ids?.length != 0) {
      flg = true
    } else if (item.exam?.question_ids?.length == 0) {
      item.exam = null
    }
  }
  if (is_need_exam.value && !flg) {
    ElMessage.error('培训内容暂未配置考题')
    return
  }

  const form = {
    ...basicForm,
    trainings_courses: examQuestionConfiguration.map((item: any) => {
      if (item.id && (item.id + '').startsWith('_')) delete item.id
      if (item.exam?.questions) delete item.exam?.questions
      return item
    })
  }

  if (id) {
    update({
      id: echoData.value.id,
      ...form
    })
  } else {
    add(form)
  }
}

const cancel = () => {
  go(-1)
}

const update = async (form: any) => {
  const result = await updateTraining(form)
  if (result.code == 200) {
    ElMessage.success('修改成功')
    isLeave = true
    back()
  } else if (result.code == 200222) {
    ElMessage.error('标题已存在')
  } else if (result.code == 200103 || result.code == 200223) {
    ElMessage.error('考试名称与其他考试重复')
  } else if (result.code == 200105) {
    ElMessage.error('部分考题被删除，请检查更新后在提交')
  } else {
    ElMessage.error((result as any).msg)
  }
}

const add = async (form: any) => {
  const result = await createTraining(form)
  if (result.code == 200) {
    ElMessage.success('新增成功')
    isLeave = true
    removeStorage('training-storage-data')
    isAddSucess.value = true
    back()
  } else if (result.code == 200222) {
    ElMessage.error('标题已存在')
  } else if (result.code == 200103 || result.code == 200223) {
    ElMessage.error('培训名称或考试内容名称重复')
  } else if (result.code == 200105) {
    ElMessage.error('部分考题被删除，请检查更新后在提交')
  } else {
    ElMessage.error((result as any).msg)
  }
}

const isDisabled = computed(() => {
  const result = menuStore.allMenuRouter.find((item) => item.meta.id == 13)
  const isCreateUser =
    userStore.userInfo?.id && userStore.userInfo?.id == echoData.value?.creator_info?.id
  const isAdmin = userStore.userInfo?.id && userStore.userInfo?.id == 1

  const edit_type = route?.query?.edit_type
  if (edit_type == 'look') return true
  if (!id) return false
  if (result?.meta?.actions) {
    const hasPut = ((result?.meta?.actions || []) as string[]).includes('PUT')
    if (hasPut && echoData.value?.status == 2 && (isCreateUser || isAdmin)) return false
  }
  return true
})

const needExamChange = (value: boolean) => {
  is_need_exam.value = value
}

onMounted(async () => {
  const data = getStorage('training-storage-data') || {}

  if (data?.id) delete data?.id

  if (!id && allPropertiesAreFalse(data, ['is_need_exam'])) {
    ElMessageBox.confirm('检测到您有未保存的草稿，是否继续编辑？', '提示', {
      confirmButtonText: '继续编辑',
      cancelButtonText: '重新编辑',
      type: 'warning'
    })
      .then(async () => {
        echoData.value = data
        basicInformationRef.value?.setTags()
      })
      .catch(() => {
        removeStorage('training-storage-data')
      })
      .finally(() => {
        pageLoading.value = false
      })
  } else {
    if (!id) return (pageLoading.value = false)
    const result = await getDetailTraining({ id })
    echoData.value = {
      ...result.data,
      duration: dayjs().startOf('day').unix() * 1000 + (result.data?.duration || 0) * 1000
    }
    pageLoading.value = false
  }
})

onBeforeUnmount(async () => {
  if (!id && !isAddSucess.value) {
    const all_content_tags_list = basicInformationRef.value?.all_content_tags_list || []
    const all_business_tags_list = basicInformationRef.value?.all_business_tags_list || []
    const examQuestionConfiguration = examQuestionConfigurationRef.value?.submit()
    const basicForm = await basicInformationRef.value?.getSubmitDate()
    setStorage('training-storage-data', {
      ...basicForm,
      id: -1,
      business_tags: (basicForm?.business_tag_ids || []).map((e: string) => {
        const data = all_business_tags_list.find((item) => e === item.value)
        return { ...data, id: data?.value || '', name: data?.label || '' }
      }),
      content_tags: (basicForm?.content_tag_ids || []).map((e: string) => {
        const data = all_content_tags_list.find((item) => e === item.value)
        return { ...data, id: data?.value || '', name: data?.label || '' }
      }),
      trainings_courses: examQuestionConfiguration
    })
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (isDisabled.value || isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('确定是否确认离开当前页面？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      next()
    })
    .catch(() => {})
})
</script>

<template>
  <ContentDetailWrap
    title="新增"
    @back="push('/examination-management/examination-view')"
    class="min-h-[var(--view-context-height)] flex flex-col"
    v-loading="pageLoading"
  >
    <template #header>
      <BaseButton @click="cancel()"> 返回 </BaseButton>
    </template>

    <el-tabs v-model="activeName" v-if="!pageLoading">
      <el-tab-pane label="基础信息" name="first">
        <BasicInformation
          ref="basicInformationRef"
          :echo-data="echoData"
          @save="save"
          @cancel="cancel()"
          :disabled="isDisabled"
          @is-need-exam-change="needExamChange"
        />
      </el-tab-pane>
      <el-tab-pane label="培训内容" name="second">
        <TrainingContent
          v-if="!isDisabled"
          ref="trainingContentRef"
          :echoData="echoData"
          :disabled="isDisabled"
        />
        <LookTrainingContent v-else :echoData="echoData" />
      </el-tab-pane>
      <el-tab-pane label="配置考题" name="third" v-if="!isDisabled" :disabled="!is_need_exam">
        <ExamQuestionConfiguration
          ref="examQuestionConfigurationRef"
          :echo-data="echoData"
          @save="save"
          @cancel="cancel()"
          :disabled="isDisabled"
        />
      </el-tab-pane>

      <el-tab-pane label="考题内容" name="fourth" v-if="isDisabled && is_need_exam">
        <ExamSituation
          ref="examSituationRef"
          :echoData="echoData"
          :id="echoData?.id ? echoData?.id + '' : ''"
        />
      </el-tab-pane>
    </el-tabs>

    <div class="m-t10px">
      <ElDivider />
      <BaseButton type="primary" :loading="loading" @click="save" v-if="!isDisabled">
        保存
      </BaseButton>
      <BaseButton v-if="!isDisabled" @click="cancel">取消</BaseButton>
    </div>
  </ContentDetailWrap>
</template>

<style lang="less" scoped>
:deep(.el-card) {
  flex: 1;
  display: flex;

  .el-card__body {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    flex: 1;
    flex-direction: column;

    .el-tabs {
      flex: 1;

      .el-tab-pane {
        height: 100%;

        .el-scrollbar {
          height: 100%;

          .el-scrollbar__view {
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
