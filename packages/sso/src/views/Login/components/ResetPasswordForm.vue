<script setup lang="tsx">
import { reactive, ref, onBeforeUnmount } from 'vue'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { ElInput, type FormRules, ElButton, ElMessage } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { useIcon } from '@/hooks/web/useIcon'
import { sendCodeApi, resetPasswordApi } from '@/api/login/index'

const emit = defineEmits(['to-login'])

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData } = formMethods
const { required, lengthRange } = useValidator()

const rules: FormRules = {
  email: [required('请输入邮箱')],
  password: [
    required('请输入密码'),
    lengthRange({ min: 8, max: 16, message: '密码长度需要大于等于八位小于十六位' })
  ],
  check_password: [
    required('请再次输入密码'),
    lengthRange({ min: 8, max: 16, message: '密码长度需要大于等于八位小于十六位' })
  ],
  code: [required('请输入验证码')]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">重置密码</h2>
        }
      }
    }
  },
  {
    field: 'email',
    label: '邮箱',
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入邮箱'
    }
  },
  {
    field: 'password',
    label: '密码',
    value: '',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入密码'
    }
  },
  {
    field: 'check_password',
    label: '确认密码',
    value: '',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入密码'
    }
  },
  {
    field: 'code',
    label: '验证码',
    value: '',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <ElInput v-model={formData.code} placeholder="请输入验证码">
                {{
                  suffix: () =>
                    showCountDown.value ? (
                      <ElButton text disabled>
                        {countDown.value + 's'}
                      </ElButton>
                    ) : (
                      <ElButton
                        text
                        icon={useIcon({ icon: 'tabler:send' })}
                        onClick={getVerificationCode}
                      />
                    )
                }}
              </ElInput>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'resetOrLogin',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <BaseButton
                  type="primary"
                  class="w-[100%]"
                  loading={loading.value}
                  onClick={resetPassword}
                >
                  重置密码
                </BaseButton>
              </div>
              <div class="w-[100%] mt-15px">
                <BaseButton class="w-[100%]" onClick={toLogin}>
                  取消
                </BaseButton>
              </div>
            </>
          )
        }
      }
    }
  }
])

const loading = ref(false)
const showCountDown = ref(false)
const countDown = ref(60)
const timer = ref<any>(null)

onBeforeUnmount(() => {
  if (timer.value && clearInterval(timer.value)) {
    timer.value = null
  }
})

const getVerificationCode = async () => {
  const formData = await getFormData()
  if (!formData.email?.length) {
    ElMessage.error('请输入邮箱')
    return
  }
  const res = await sendCodeApi({ email: formData.email })
  if (res.code === 200) {
    ElMessage.success('验证码发送成功')
    showCountDown.value = true
    countDown.value = 60
    timer.value && clearInterval(timer.value)
    timer.value = null
    timer.value = setInterval(() => {
      countDown.value--
      if (countDown.value < 1) {
        clearInterval(timer.value)
        showCountDown.value = false
        timer.value = null
      }
    }, 1000)
  } else {
    let errMsg = '验证码发送失败'
    if (res.code === 100002) {
      errMsg = '验证码发送失败，该用户不存在'
    } else if (res.code === 300001) {
      errMsg = '验证码发送失败，邮箱不是亿达邮箱'
    }
    ElMessage.error(errMsg)
  }
}

const resetPassword = async () => {
  const formRef = await getElFormExpose()
  formRef?.validate(async (valid) => {
    if (valid) {
      const formData = await getFormData()
      formData.email = formData.email?.trim()
      if (formData.password !== formData.check_password) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
      if (!formData.code?.length) {
        ElMessage.error('请输入验证码')
        return
      }
      if (Number.isNaN(Number(formData.code))) {
        ElMessage.error('验证码格式不正确')
        return
      }
      loading.value = true
      const res = await resetPasswordApi({
        email: formData.email,
        password: formData.password,
        code: Number(formData.code)
      })
      loading.value = false
      if (res.code === 200) {
        ElMessage.success('重置密码成功')
        toLogin()
      } else {
        let errMsg = '重置密码失败'
        if (res.code === 100002) {
          errMsg = '重置密码失败，该用户不存在'
        } else if (res.code === 300001) {
          errMsg = '邮箱错误，请检查邮箱地址'
        } else if (res.code === 101000) {
          errMsg = '验证码无效，请重新输入'
        } else if (res.code === 101007) {
          errMsg = '密码长度大于等于八位小于十六位'
        } else if (res.code === 100010) {
          errMsg = '邮箱和密码不一致，请重新输入'
        } else if (res.code === 300002) {
          errMsg = '邮箱和密码不一致，请重新输入'
        } else if (res.code === 500101) {
          errMsg = '请输入正确的邮箱地址'
        }
        ElMessage.error(errMsg)
      }
    }
  })
}

const toLogin = () => {
  emit('to-login')
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>

<style lang="less" scoped>
:deep(.el-col:nth-child(5)) {
  .el-input__wrapper {
    padding-right: 1px;
  }
}
</style>
