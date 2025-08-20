<script setup lang="ts">
import BasicInformation from './components/BasicInformation.vue'
import EventTracking from './components/EventTracking.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import EditLookDrawer from './components/EditLookDrawer.vue'

import { useUserStore } from '@/stores/user'
import { createKnowledgeBase, getKnowledgeBase, updateKnowledgeBase } from '@/api/knowledgeBase'
import { useMenuStore } from '@/stores/menuView'
const show = ref(false)
const loading = ref(false)
const route = useRoute()
const pageLoading = ref(true)
const echoData = ref<any>()
const menuStore = useMenuStore()
const id: string = (route?.query?.id || '') as string
const { push, go, back } = useRouter()
const activeName = ref('first')
const isShowEventTracking = ref(false)
const userStore = useUserStore()
const basicInformationRef = ref<ComponentRef<typeof BasicInformation>>()
const eventTrackingRef = ref<ComponentRef<typeof EventTracking>>()
let catchDate: any = null
let clearText = '离开'
let isLeave: boolean = false
const getSubmitDate = async () => {
  const basicForm = await basicInformationRef.value?.submit()
  let process_schedule_list: any = []

  if (!basicForm) {
    ElMessage.error('请填写基础信息必填项')
    return false
  }

  if (isShowEventTracking.value) {
    process_schedule_list = await eventTrackingRef.value?.submit()
    if (!process_schedule_list) {
      ElMessage.error('请填写事件跟踪必填项')
      return false
    }
  }
  basicForm.process_schedule_list = process_schedule_list
  return basicForm
}

const save = async () => {
  const basicForm = await getSubmitDate()
  if (!basicForm) return
  if (id) {
    update({
      id: echoData.value.id,
      ...basicForm
    })
  } else {
    add(basicForm)
  }
}

const cancel = (text: string) => {
  clearText = text
  go(-1)
}

const update = async (form: any) => {
  const result = await updateKnowledgeBase(form)
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
  const result = await createKnowledgeBase(form)
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

const showEventTracking = (val: boolean) => {
  isShowEventTracking.value = val
}

const isDisabled = computed(() => {
  const result = menuStore.allMenuRouter.find((item) => item.meta.id == 10)
  const isCreateUser =
    userStore.userInfo?.id && userStore.userInfo?.id == echoData.value?.creator_info?.id
  const isAdmin = userStore.userInfo?.id && userStore.userInfo?.id == 1
  const edit_type = route?.query?.edit_type
  if (edit_type == 'look') return true
  if (!id) return false
  if (result?.meta?.actions) {
    const hasPut = ((result?.meta?.actions || []) as string[]).includes('PUT')
    if (hasPut && (isCreateUser || isAdmin)) return false
  }
  return true
})

const preview = async () => {
  const basicForm = await getSubmitDate()

  if (!basicForm) return
  catchDate = {
    ...basicForm,
    created_at: echoData.value?.created_at || new Date()
  }

  show.value = true
}

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

onMounted(async () => {
  if (!id) return (pageLoading.value = false)
  const result = await getKnowledgeBase({ id })

  echoData.value = {
    ...result.data
  }
  pageLoading.value = false
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

    <el-tabs v-model="activeName">
      <el-tab-pane label="资料库信息" name="first">
        <BasicInformation
          ref="basicInformationRef"
          :btn-loading="loading"
          :echoData="echoData"
          :disabled="isDisabled"
          @showEventTracking="showEventTracking"
        />
      </el-tab-pane>

      <el-tab-pane label="事件进度跟踪" name="second" :disabled="!isShowEventTracking">
        <EventTracking ref="eventTrackingRef" :echoData="echoData" :disabled="isDisabled" />
      </el-tab-pane>
    </el-tabs>

    <ElDivider />
    <div>
      <BaseButton type="primary" :loading="loading" @click="save" v-if="!isDisabled">
        保存
      </BaseButton>
      <BaseButton type="success" @click="preview"> 预览 </BaseButton>
      <BaseButton @click="cancel('取消')">取消</BaseButton>
    </div>
  </ContentDetailWrap>
  <EditLookDrawer :title="'资料库信息详情'" v-model:model-value="show" :echoData="catchDate" />
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
