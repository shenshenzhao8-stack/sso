<script setup lang="tsx">
import { ref, reactive } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import type { FormSchema } from '@/components/Form'
import { Form, type SelectOption } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { dataAssetsFixedUserList } from '@/api/assets-fixed'
import { dataAssetsConsumablesOut } from '@/api/assets-consumables'
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
  },
  {
    field: 'user_id',
    label: '领取人',
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
    const formData = await getFormData()
    await dataAssetsConsumablesOut({
      id: id,
      stock_num: Number(formData.num),
      receiver: formData.user_id
    }).then((res) => {
      if (res.code === 200) {
        refresh()
        ElMessage.success('出库成功')
        handleClose()
        return
      }
      if (res.code === 502000) {
        ElMessage.error('库存不足，请补充库存后操作')
        return
      }
      ElMessage.error(res.msg)
    })
  }
}

const handleClose = (): void => {
  dialogVisible.value = false
}
</script>
<template>
  <Dialog v-model="dialogVisible" title="出库" :before-close="handleClose" :max-height="200">
    <Form @register="formRegister" :schema="schema" />

    <template #footer>
      <BaseButton @click="handleClick">出库</BaseButton>
      <BaseButton @click="handleClose">关闭</BaseButton>
    </template>
  </Dialog>
</template>
