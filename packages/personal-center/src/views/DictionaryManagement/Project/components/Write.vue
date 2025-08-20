<script setup lang="tsx">
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { type PropType, reactive, watch } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { cloneDeep } from 'lodash-es'

const { required, lengthRange, notSpace } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const formSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '项目名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入项目名称'
    },
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  name: [
    required(),
    lengthRange({ min: 1, max: 20, message: '项目名称长度在20字符以内' }),
    notSpace()
  ]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData
  }
}
watch(
  () => props.currentRow,
  (value) => {
    if (!value) return
    const currentRow = cloneDeep(value)
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)
defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
</template>
