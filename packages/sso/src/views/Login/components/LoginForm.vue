<script setup lang="tsx">
import { reactive, ref, watch } from 'vue'
import { Form, type FormSchema } from '@/components/Form'
import { ElButton, ElMessage } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi, getTopMenu } from '@/api/login'
import { useAppStore } from '@/stores/app'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { UserLoginType } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/stores/user'
import { getUserInfoApi } from '@/api/login'
import { BaseButton } from '@/components/Button'
import { localStorageHelper } from '@ff/utils'
import { EToken } from '@/enum/index'

const emit = defineEmits(['to-reset-password'])

const appStore = useAppStore()
const userStore = useUserStore()

const { currentRoute, push } = useRouter()

const { required, lengthRange } = useValidator()
const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues } = formMethods

const rules = {
  email: [required('请输入邮箱')],
  password: [
    required('请输入密码'),
    lengthRange({ min: 8, max: 16, message: '密码长度需要大于等于八位小于十六位' })
  ]
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
          return <h2 class="text-2xl font-bold text-center w-[100%]">登录</h2>
        }
      }
    }
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入邮箱',
      onkeydown: (e: any) => {
        if (e.keyCode === 13) {
          signIn()
        }
      }
    }
  },
  {
    field: 'password',
    label: '密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入密码',
      onkeydown: (e: any) => {
        if (e.keyCode === 13) {
          signIn()
        }
      }
    }
  },
  {
    field: 'tool',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="flex justify-end items-center w-[100%]">
                <ElButton
                  style={{ fontSize: '12px' }}
                  type="primary"
                  text
                  onClick={() => emit('to-reset-password')}
                >
                  忘记密码
                </ElButton>
              </div>
            </>
          )
        }
      }
    }
  },
  {
    field: 'login',
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
                  loading={loading.value}
                  type="primary"
                  class="w-[100%]"
                  onClick={signIn}
                >
                  登录
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
const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

const { query } = useRoute()

const str: string = query?.redirectURL as string
// 登录
const signIn = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const formData = await getFormData<UserLoginType>()
      formData.email = formData.email.trim()

      const res = await loginApi(formData)

      if (res.code === 200) {
        userStore.setToken(res.data?.token)
        userStore.setRefreshToken(res.data?.refresh_token)
        localStorageHelper.set({
          key: EToken.TOKEN,
          value: res.data?.token,
          expire: 2
        })

        localStorageHelper.set({
          key: EToken.REFRESH_TOKEN,
          value: res.data?.refresh_token,
          expire: 30
        })

        const infoRes = await getUserInfoApi({})
        userStore.setUserInfo(infoRes.data)

        const menu = await getTopMenu()
        if (menu.code === 200 && menu.data.length > 0) {
          push({
            path: '/home',
            replace: true,
            query: {
              redirectURL: str
            }
          })
        } else {
          localStorageHelper.clear()
          ElMessage.error('暂无权限，请联系管理员')
          loading.value = false
        }
      } else {
        let errMsg = '登录失败'
        if (res.code === 100002) {
          errMsg = '登录失败，该用户不存在'
        } else if (res.code === 100003) {
          errMsg = '邮箱和密码不一致，请确认后登录'
        } else if (res.code === 300001) {
          errMsg = '邮箱错误，请检查邮箱地址'
        } else if (res.code === 100011) {
          errMsg = '登录失败，该用户已离职'
        } else if (res.code === 300002) {
          errMsg = '邮箱和密码不一致，请重新输入'
        } else if (res.code === 500101) {
          errMsg = '请输入正确的邮箱地址'
        }
        localStorageHelper.delete(EToken.TOKEN)
        localStorageHelper.delete(EToken.REFRESH_TOKEN)
        ElMessage.error(errMsg)
      }
    }

    loading.value = false
  })
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
