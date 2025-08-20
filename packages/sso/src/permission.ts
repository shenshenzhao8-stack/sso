import router from './router'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { localStorageHelper } from '@ff/utils'
import { EToken } from '@/enum'

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

router.beforeEach(async (to, from, next) => {
  start()
  loadStart()

  // 获取本地存储的 token 和 refreshToken
  const token = localStorageHelper.get(EToken.TOKEN)
  const refreshToken = localStorageHelper.get(EToken.REFRESH_TOKEN)

  // 检查是否有 token 或 refreshToken
  const hasTokens = token && refreshToken

  if (!hasTokens) {
    // 没有 token 或 refreshToken 时的处理
    to.path === '/' ? next() : next('/')
  } else {
    // 有 token 和 refreshToken 时的处理
    if (to.path === '/') {
      const redirectURL = to.query?.redirectURL ? `?redirectURL=${to.query.redirectURL}` : ''

      next(`/home${redirectURL}`)
    } else {
      next()
    }
  }
})

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done()
  loadDone()
})
