<script setup lang="ts">
import BasicInformation from './components/BasicInformation.vue'
import ExamQuestionConfiguration from './components/ExamQuestionConfiguration.vue'
import ExamSituation from './components/ExamSituation.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { ElScrollbar, ElMessage, ElMessageBox } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createExam, getExamDetail, updateExam } from '@/api/examination'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menuView'
const loading = ref(false)
const route = useRoute()
const pageLoading = ref(true)
const echoData = ref<any>()
const id: string = (route?.query?.id || '') as string
const activeName = ref('first')
const { push, go, back } = useRouter()
const menuStore = useMenuStore()
const userStore = useUserStore()
const basicInformationRef = ref<ComponentRef<typeof BasicInformation>>()
const examQuestionConfigurationRef = ref<ComponentRef<typeof ExamQuestionConfiguration>>()

import { onBeforeRouteLeave } from 'vue-router'
let clearText = '离开'
let isLeave: boolean = false

const save = async () => {
  const basicForm = await basicInformationRef.value?.submit()
  if (!basicForm) {
    ElMessage.error('请填写基础信息必填项')
    return
  }
  const examQuestionConfiguration = await examQuestionConfigurationRef.value?.submit()
  if (!examQuestionConfiguration) {
    ElMessage.error('请填写考题配置必填项')
    return
  }

  const form = {
    ...basicForm,
    ...examQuestionConfiguration
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

const cancel = (text: string) => {
  clearText = text
  go(-1)
}

const update = async (form: any) => {
  const result = await updateExam(form)
  if (result.code == 200) {
    ElMessage.success('修改成功')
    isLeave = true
    back()
  } else if (result.code == 200102) {
    ElMessage.error('标题已存在')
  } else {
    ElMessage.error((result as any).msg)
  }
}

const add = async (form: any) => {
  if (form.questionIds?.length == 0) {
    return ElMessage.error('请添加考题')
  }
  const result = await createExam(form)
  if (result.code == 200) {
    ElMessage.success('新增成功')
    isLeave = true
    back()
  } else if (result.code == 200102) {
    ElMessage.error('标题已存在')
  } else {
    ElMessage.error((result as any).msg)
  }
}

const isDisabled = computed(() => {
  const result = menuStore.allMenuRouter.find((item) => item.meta.id == 14)
  const isCreateUser =
    userStore.userInfo?.id && userStore.userInfo?.id == echoData.value?.creator_info?.id
  const isAdmin = userStore.userInfo?.id && userStore.userInfo?.id == 1
  const edit_type = route?.query?.edit_type
  if (edit_type == 'look') return true
  if (!id) return false
  if (result?.meta?.actions) {
    const hasPut = ((result?.meta?.actions || []) as string[]).includes('PUT')
    if (hasPut && echoData.value.status == 2 && (isCreateUser || isAdmin)) return false
  }
  return true
})

onMounted(async () => {
  if (!id) return (pageLoading.value = false)
  const result = await getExamDetail(id)
  echoData.value = {
    ...result.data,
    duration: dayjs().startOf('day').unix() * 1000 + (result.data?.duration || 0) * 1000
  }
  pageLoading.value = false
})

onBeforeRouteLeave((to, from, next) => {
  if (isDisabled.value || isLeave) {
    next()
    return
  }
  ElMessageBox.confirm(clearText + '后编辑内容会丢失，确定关闭？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      next()
    })
    .catch(() => {})
    .finally(() => {
      clearText = '离开'
    })
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
      <BaseButton @click="cancel('返回')"> 返回 </BaseButton>
    </template>

    <el-tabs v-model="activeName" v-if="!pageLoading">
      <el-tab-pane label="基础信息" name="first">
        <ElScrollbar>
          <BasicInformation
            ref="basicInformationRef"
            :btn-loading="loading"
            :echoData="echoData"
            @save="save"
            @cancel="cancel('取消')"
            :disabled="isDisabled"
          />
        </ElScrollbar>
      </el-tab-pane>
      <el-tab-pane label="配置考题" name="second" v-if="!isDisabled">
        <ElScrollbar>
          <ExamQuestionConfiguration
            ref="examQuestionConfigurationRef"
            :btn-loading="loading"
            :echoData="echoData"
            @save="save"
            @cancel="cancel('取消')"
          />
        </ElScrollbar>
      </el-tab-pane>
      <el-tab-pane label="考试情况" name="third" v-if="isDisabled">
        <ExamSituation
          ref="examSituationRef"
          :echoData="echoData"
          :id="echoData?.id"
          :create-user-id="echoData?.creator_info?.id"
        />
      </el-tab-pane>
    </el-tabs>
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
