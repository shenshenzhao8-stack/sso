<template>
  <ElDrawer
    v-model:model-value="dialogVisible"
    size="50vw"
    :title="'添加培训课程'"
    @closeDoalog="close"
    v-bind="$attrs"
  >
    <Form :rules="rules" @register="formRegister" :schema="schema" />

    <slot name="footer"></slot>
  </ElDrawer>
</template>

<script setup lang="tsx">
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { getTimeNumber } from '@/utils'
import { ElDrawer } from 'element-plus'
import { computed, nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({
  editContent: {
    type: Object
  },
  modelValue: {
    type: Boolean
  },
  name: {
    type: String
  }
})
const emit = defineEmits(['update:modelValue', 'closeDoalog'])
const { required, lengthRange } = useValidator()
const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const schema = ref<FormSchema[]>([
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    componentProps: {
      placeholder: '标题'
    },
    formItemProps: {
      rules: [lengthRange({ min: 1, max: 30, message: '标题名称长度在30字符以内' })]
    }
  },

  {
    field: 'duration',
    component: 'TimePicker',
    label: `时长`,
    formItemProps: {
      rules: [
        required(),
        {
          validator: (_, value) => {
            const time = getTimeNumber(new Date(value))
            if (time <= 0) {
              return new Error('时长不能为0')
            }
            return true
          }
        }
      ]
    }
  },
  {
    field: 'content',
    component: 'Editor',
    colProps: {
      span: 24
    },
    componentProps: {
      // height: 300,
      defaultHtml: '',

      // @ts-ignore
      onChange: (edit: IDomEditor) => {
        setValues({
          content: edit.getHtml()
        })
      }
    },
    label: '培训内容'
  }
])

const rules = reactive({
  title: [required()]
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

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
  () => props.modelValue,
  async (value) => {
    if (!value) return
    const elForm = await getElFormExpose()
    elForm?.resetFields()
    nextTick(() => {
      if (props.editContent && Object.keys(props.editContent).length) {
        setValues(props.editContent)
      }
    })
  },
  {
    immediate: true
  }
)

const close = async () => {
  const elForm = await getElFormExpose()
  elForm?.resetFields()
  emit('closeDoalog')
}

defineExpose({
  submit
})
</script>
<style lang="less" scoped>
:deep(img) {
  -webkit-user-drag: none;
}
</style>
