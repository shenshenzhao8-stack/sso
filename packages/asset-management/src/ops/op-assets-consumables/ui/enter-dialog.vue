<script setup lang="tsx">
import { ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import type { FormSchema } from '@/components/Form'
import { Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { dataAssetsConsumablesEnter } from '@/api/assets-consumables'
import { ElMessage } from 'element-plus'

const { visible, id, refresh } = defineProps<{
  visible?: boolean
  id: number
  refresh: () => void
}>()

const dialogVisible = ref(visible)

const { formMethods, formRegister } = useForm()
const { required } = useValidator()

const schema = reactive<FormSchema[]>([
  {
    field: 'num',
    label: '数量',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    },
    colProps: {
      span: 24
    }
  }
])

const { getFormData, getElFormExpose } = formMethods

const handleClick = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    handleClose()
    const formData = await getFormData()
    await dataAssetsConsumablesEnter({
      id: id,
      stock_num: Number(formData.num)
    }).then((res) => {
      if (res.code !== 200) {
        ElMessage.error(res.msg)
        return
      }
      ElMessage.success('入库成功')
      refresh()
    })
  }
}

const handleClose = (): void => {
  dialogVisible.value = false
}
</script>
<template>
  <Dialog v-model="dialogVisible" title="入库" :before-close="handleClose" :max-height="200">
    <Form @register="formRegister" :schema="schema" />

    <template #footer>
      <BaseButton @click="handleClick">入库</BaseButton>
      <BaseButton @click="handleClose">关闭</BaseButton>
    </template>
  </Dialog>
</template>
