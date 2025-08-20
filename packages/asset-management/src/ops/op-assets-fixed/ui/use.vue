<script setup lang="tsx">
import { ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import type { FormSchema } from '@/components/Form'
import { Form, type SelectOption } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { dataAssetsFixedUserList, dataAssetsFixedUse } from '@/api/assets-fixed'
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
    field: 'user_id',
    label: '领用人',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    },
    optionApi: async () => {
      const res = await dataAssetsFixedUserList()

      return res.data.result?.map((v: any) => ({
        label: v.name,
        value: v.id,
        email: v.email
      }))
    },
    componentProps: {
      filterable: true,
      slots: {
        optionDefault: (option: SelectOption) => {
          return (
            <>
              <span style="float: left">{option.label}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">
                {option.email}
              </span>
            </>
          )
        }
      }
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

    dataAssetsFixedUse({
      user_id: formData.user_id,
      id
    }).then((res) => {
      if (res.code === 200) {
        ElMessage.success('领用成功')
        refresh()
        return
      }
      ElMessage.error('领用失败')
    })
  }
}

const handleClose = (): void => {
  dialogVisible.value = false
}

defineExpose({
  submit: handleClick
})
</script>
<template>
  <Dialog v-model="dialogVisible" title="领用" :before-close="handleClose" :max-height="100">
    <Form @register="formRegister" :schema="schema" />

    <template #footer>
      <BaseButton @click="handleClose">关闭</BaseButton>

      <BaseButton @click="handleClick" type="primary">确定</BaseButton>
    </template>
  </Dialog>
</template>
