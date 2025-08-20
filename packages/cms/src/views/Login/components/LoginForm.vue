<script setup lang="tsx">
import { reactive, ref, watch, onMounted, unref } from 'vue'
import { Form, type FormSchema } from '@/components/Form'
import { ElCheckbox, ElButton, ElMessage } from 'element-plus'
import { useForm } from '@/hooks/web/useForm'
import { loginApi, getUserInfoApi } from '@/api/login'
import { getMenuListApi } from '@/api/menu/index'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import type { UserLoginType } from '@/api/login/types'
import { useValidator } from '@/hooks/web/useValidator'
import { useUserStore } from '@/stores/user'
import { BaseButton } from '@/components/Button'
import { useMenuStore } from '@/stores/menuView'
import { isArray } from '@/utils/is'

const emit = defineEmits(['to-reset-password'])
const menuStore = useMenuStore()

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

const remember = ref(userStore.getRememberMe)
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

onMounted(() => {
  // initLoginInfo()
})

const initLoginInfo = () => {
  const loginInfo = userStore.getLoginInfo
  if (loginInfo) {
    const { email, password } = loginInfo
    setValues({ email, password })
  }
}

// 登录
const signIn = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const formData = await getFormData<UserLoginType>()
      formData.email = formData.email.trim()

      try {
        const res = await loginApi(formData)
        loading.value = false
        if (res.code === 200) {
          // 是否记住我
          // if (unref(remember)) {
          //   userStore.setLoginInfo(formData)
          // } else {
          //   userStore.setLoginInfo(undefined)
          // }
          // userStore.setRememberMe(unref(remember))
          userStore.setToken(res.data?.token)
          userStore.setRefreshToken(res.data?.refresh_token)

          const infoRes = await getUserInfoApi({})
          userStore.setUserInfo(infoRes.data)

          // 是否使用动态路由
          // if (appStore.getDynamicRouter) {

          //   await permissionStore.generateRoutes('static').catch(() => {})
          //   permissionStore.getAddRouters.forEach((route) => {
          //     addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
          //   })
          //   permissionStore.setIsAddRouters(true)
          //   push({ path: redirect.value || permissionStore.addRouters[0].path })
          // } else {
          //   await permissionStore.generateRoutes('static').catch(() => {})
          //   permissionStore.getAddRouters.forEach((route) => {
          //     addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
          //   })
          //   permissionStore.setIsAddRouters(true)
          //   push({ path: redirect.value || permissionStore.addRouters[0].path })
          // }
          getRole()

          appStore.setShowResetPassword(infoRes.data?.initial_password === 1)
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
          ElMessage.error(errMsg)
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 获取角色信息
const getRole = async () => {
  const res = await getMenuListApi()
  if (res.code == 200) {
    const routers = res.data
    if (!isArray(routers) || routers.length === 0) {
      ElMessage.error('您没有登录权限，如需登录请联系管理员或部门负责人开通')
      userStore.reset()
      return
    }
    ElMessage.success('登录成功')
    const menuList = menuStore.initMenuRouter(routers)
    menuStore.setMenuList(menuList)
    const path = routers.find((item: any) => item.path)?.path
    if (!path) return
    push({ path: path })
  } else {
    let errMsg = '登录失败'
    if (res.code === 403) {
      errMsg = '暂无权限，请联系管理员'
    }
    ElMessage.error(errMsg)
    userStore.reset()
  }
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
