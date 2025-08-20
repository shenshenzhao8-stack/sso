<script setup lang="tsx">
import { type PropType, reactive, ref, watch } from 'vue'
import { Dialog } from '@/components/Dialog/index'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { type FormRules, ElMessage } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import type { UserType } from '@/api/login/types'
import { addUserApi, userUpdateApi, managerResetUserPasswordApi } from '@/api/login/index'

const props = defineProps({
  currentRow: {
    type: Object as PropType<Nullable<UserType>>,
    default: () => null
  },
  type: {
    type: String as PropType<'add' | 'edit'>,
    default: () => 'add'
  }
})

watch(
  () => props.type,
  (val: string) => {
    if (schema.length < 1) return
    if (!schema[0].componentProps) return
    schema[0].componentProps.disabled = val === 'add' ? false : true
  }
)

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues({
      name: currentRow.name,
      email: currentRow.email
    })
  },
  {
    deep: true,
    immediate: true
  }
)

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues } = formMethods
const { required, notSpecialCharacters } = useValidator()

const rules: FormRules = {
  email: [required('请输入邮箱')],
  name: [required('请输入用户名'), notSpecialCharacters('用户名不能包含特殊字符')]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'email',
    label: '邮箱',
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入邮箱',
      disabled: props.type === 'add' ? false : true
    }
  },
  {
    field: 'name',
    label: '用户名',
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入用户名'
    }
  }
])

const dialogVisible = ref(false)
const saveLoading = ref(false)
const resetLoading = ref(false)

const submitAction = async () => {
  const formRef = await getElFormExpose()
  formRef?.validate(async (valid) => {
    if (valid) {
      const formData = await getFormData()
      saveLoading.value = true
      if (props.type === 'add') {
        const res = await addUserApi({
          users: [formData as { email: string; name: string }]
        })
        saveLoading.value = false
        if (res.code === 200) {
          ElMessage.success('添加用户成功')
          emit('updateList')
          dialogVisible.value = false
        } else {
          let errMsg = '添加用户失败'
          if (res.code === 100006) {
            errMsg = '添加用户失败，该用户已存在'
          } else if (res.code === 100012) {
            errMsg = '邮箱错误，请检查邮箱地址'
          }
          ElMessage.error(errMsg)
        }
      } else {
        if (!props.currentRow?.id) return
        const res = await userUpdateApi({
          id: props.currentRow.id,
          name: formData.name
        })
        saveLoading.value = false
        if (res.code === 200) {
          ElMessage.success('保存用户信息成功')
          emit('updateList')
          dialogVisible.value = false
        } else {
          ElMessage.error('保存用户信息失败')
        }
      }
    }
  })
}

const resetPasswordAction = async () => {
  if (!props.currentRow?.id) return
  resetLoading.value = true
  const res = await managerResetUserPasswordApi({
    id: props.currentRow.id
  })
  resetLoading.value = false
  if (res.code === 200) {
    dialogVisible.value = false
    ElMessage.success('密码重置成功')
  } else {
    ElMessage.error('密码重置失败')
  }
}

defineExpose({
  open: () => {
    dialogVisible.value = true
  }
})

const emit = defineEmits(['updateList'])
</script>

<template>
  <Dialog v-model="dialogVisible" width="500px" max-height="200px">
    <template #title>
      <div class="m-auto">{{ type === 'add' ? '新增用户' : '编辑用户' }}</div>
    </template>
    <Form
      :schema="schema"
      :rules="rules"
      label-position="top"
      hide-required-asterisk
      size="large"
      class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
      @register="formRegister"
    />
    <template #footer>
      <div class="w-[100%] flex pl-10px pr-10px">
        <div class="flex">
          <BaseButton type="primary" class="w-[100%]" :loading="saveLoading" @click="submitAction">
            确认
          </BaseButton>
          <BaseButton type="default" class="w-[100%]" @click="dialogVisible = false">
            取消
          </BaseButton>
        </div>
        <div class="ml-auto" v-if="type === 'edit'">
          <BaseButton
            type="primary"
            class="w-[100%]"
            :loading="resetLoading"
            @click="resetPasswordAction"
          >
            重置密码
          </BaseButton>
        </div>
      </div>
    </template>
  </Dialog>
</template>
