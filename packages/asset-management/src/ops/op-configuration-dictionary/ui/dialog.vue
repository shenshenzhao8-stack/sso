<script setup lang="tsx">
import { ref, reactive, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import type { FormSchema } from '@/components/Form'
import { Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import {
  dataConfigurationDictionaryAdd,
  dataConfigurationDictionaryEdit
} from '@/api/configuration-dictionary'

interface DataProps {
  id?: number // Adjust the type of id as needed
  [key: string]: any // Allow other properties
}

const { visible, data, refresh } = defineProps<{
  visible?: boolean
  data: DataProps
  refresh?: () => void
}>()

const dialogVisible = ref(visible)

const { formMethods, formRegister } = useForm()
const { required } = useValidator()

const categoryType = [
  {
    value: 1,
    label: '固定资产',
    type: 'success'
  },
  {
    value: 2,
    label: '消耗品',
    type: 'info'
  }
]

const schema = reactive<FormSchema[]>([
  {
    field: 'type',
    label: '物品类型',
    component: 'Input',
    formItemProps: {
      rules: [required()]
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'category',
    label: '物品类别',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      options: categoryType
    },
    colProps: {
      span: 24
    }
  }
])

const { getFormData, getElFormExpose, setValues } = formMethods

const handleClick = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    const res = data?.id
      ? await dataConfigurationDictionaryEdit({ id: data.id, ...formData })
      : await dataConfigurationDictionaryAdd(formData)

    if (res.code === 500001) {
      ElMessage.error('名称重复')
      return
    }

    handleClose()

    if (res.code === 200) {
      ElMessage.success(data?.id ? '编辑成功' : '新增成功')
      refresh?.()
    }
  }
}

const handleClose = (): void => {
  dialogVisible.value = false
}

watch(
  () => data,
  (currentRow) => {
    if (!currentRow) return
    nextTick(() => setValues(currentRow))
  },
  {
    deep: true,
    immediate: true
  }
)
</script>
<template>
  <Dialog
    v-model="dialogVisible"
    :title="data ? '编辑' : '新增'"
    :before-close="handleClose"
    max-height="100"
  >
    <Form @register="formRegister" :schema="schema" />

    <template #footer>
      <BaseButton @click="handleClick" type="primary">确定</BaseButton>
      <BaseButton @click="handleClose">关闭</BaseButton>
    </template>
  </Dialog>
</template>
