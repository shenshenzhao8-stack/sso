<script lang="tsx" setup>
import { ElDrawer, ElMessageBox, ElScrollbar, ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { BaseButton } from '@/components/Button'
import {
  dataPermissionsCreate,
  dataPermissionsEdit,
  dataPermissionsDetail
} from '@/api/permissions'

import Form from './form.vue'

const props = withDefaults(
  defineProps<{
    dialogVisible?: boolean
    dialogTitle?: string
    id?: number
    refresh?: () => void
  }>(),
  {
    dialogTitle: '新增',
    dialogVisible: true
  }
)

const detail = ref()

onMounted(() => {
  if (props.id) {
    dataPermissionsDetail(props.id).then((res) => {
      detail.value = res.data
    })
  }
})

const _dialogVisible = ref<boolean>(props.dialogVisible)
const drawerBeforeClose = (done: (cancel?: boolean) => void) => {
  ElMessageBox.confirm('取消后修改内容会丢失，确定关闭？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (done) done(false)
      _dialogVisible.value = false
    })
    .catch(() => {
      if (done) done(true)
    })
}
const formRef = ref()

const handleClick = () => {
  formRef.value?.submit().then(async (value: any) => {
    if (value) {
      const res = (await props.id)
        ? dataPermissionsEdit({
            id: props.id,
            ...value
          })
        : dataPermissionsCreate(value)

      if ((await res).code === 500201) return ElMessage.error('角色名称已存在')

      if ((await res).code !== 200) return ElMessage.error('保存失败')

      _dialogVisible.value = false
      props.refresh?.()
    }
  })
}
</script>
<template>
  <ElDrawer
    v-model="_dialogVisible"
    :title="dialogTitle"
    size="50vw"
    :before-close="drawerBeforeClose"
  >
    <ElScrollbar style="min-width: 660px">
      <Form ref="formRef" :current-row="detail" />
    </ElScrollbar>
    <template #footer>
      <BaseButton type="primary" @click="handleClick"> 保存 </BaseButton>
      <BaseButton @click="drawerBeforeClose">关闭</BaseButton>
    </template>
  </ElDrawer>
</template>
