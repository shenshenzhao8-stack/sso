<script setup lang="tsx">
import { reactive, ref, watch, type PropType } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { type FormRules } from 'element-plus'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { Plus, Minus } from '@element-plus/icons-vue'
import { BaseButton } from '@/components/Button'
import { getUserListApi } from '@/api/dimission/index'
import type { UserInfoType, EmailGroupItemType } from '@/api/dimission/types'

const props = defineProps({
  tag: {
    type: Number,
    default: 0
  },
  emailGroup: {
    type: Object as PropType<Nullable<EmailGroupItemType>>,
    default: () => null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['addReceiverEmail', 'deleteReceiverEmail'])

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues, setSchema } = formMethods
const { required } = useValidator()

watch(
  () => props.emailGroup,
  (val) => {
    if (val) {
      setSchema([
        {
          field: 'user_id',
          path: 'componentProps.options',
          value: [
            {
              label: val.user_info.name,
              value: val.user_info.id
            }
          ]
        }
      ])
      setValues({
        user_id: val.user_id,
        send_type: val.send_type,
        email: val.user_info.email
      })
    }
  },
  {
    immediate: true
  }
)

const requestReceiver = async (query: string) => {
  const res = await getUserListApi({ name: query, user_type: 1 })
  userInfos.value = res.data.result
  const userList =
    res.data.result?.map((item: UserInfoType) => ({
      label: item.name,
      value: item.id
    })) ?? []
  setSchema([
    {
      field: 'user_id',
      path: 'componentProps.options',
      value: userList
    }
  ])
}

const rules: FormRules = {
  user_id: [required('请选择收件人')],
  send_type: [required('请选择收件人类型')]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'user_id',
    label: '收件人',
    colProps: {
      span: 8
    },
    component: 'Select',
    componentProps: {
      placeholder: '请选择收件人',
      filterable: true,
      remote: true,
      remoteShowSuffix: true,
      remoteMethod: requestReceiver,
      on: {
        change: (value: number) => {
          const currentUser = userInfos.value.find((item) => item.id === value)
          setValues({
            email: currentUser?.email || ''
          })
        }
      }
    }
  },
  {
    field: 'send_type',
    label: '类型',
    value: 1,
    colProps: {
      span: 8
    },
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '收件人',
          value: 1
        },
        {
          label: '抄送人',
          value: 2
        }
      ]
    }
  },
  {
    field: 'email',
    label: '邮箱',
    colProps: {
      span: 8
    },
    component: 'Input',
    componentProps: {
      disabled: true,
      placeholder: ''
    }
  }
])

const userInfos = ref<UserInfoType[]>([])

const submitAction = async () => {
  let formData: any
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      formData = await getFormData<any>()
    }
  })
  return formData
}

defineExpose({
  submitAction
})
</script>

<template>
  <div class="flex">
    <ContentWrap class="flex-1">
      <Form :schema="schema" :rules="rules" @register="formRegister" :disabled="disabled" />
    </ContentWrap>
    <div class="ml-10px flex flex-col width-[100px]">
      <BaseButton
        type="primary"
        :icon="Plus"
        @click="$emit('addReceiverEmail', tag)"
        :disabled="disabled"
        >添加</BaseButton
      >
      <BaseButton
        type="danger"
        :icon="Minus"
        @click="$emit('deleteReceiverEmail', tag)"
        :disabled="disabled"
        >删除</BaseButton
      >
    </div>
  </div>
</template>

<style lang="less" scoped>
.el-card {
  border: 1px solid #000;
  border-radius: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.el-button {
  margin-left: 0;
}

.el-button:last-child {
  margin-top: 8px;
}
</style>
