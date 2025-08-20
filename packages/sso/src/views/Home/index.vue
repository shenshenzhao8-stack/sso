<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { getTicket, getTopMenu } from '@/api/login'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'

const { query } = useRoute()

const str: string = query?.redirectURL as string

const { logout } = useUserStore()

async function router() {
  const res = await getTicket()

  if (res.code !== 200) {
    return
  }

  if (!str) {
    getTopMenu().then((menu: any) => {
      if (menu.code === 200 && menu.data.length > 0) {
        window.location.replace(`${menu.data[0]?.url}?ticket=${res.data.ticket}`)
      } else {
        ElMessage.error('暂无权限，请联系管理员')
        logout()

        return
      }
    })

    return
  }
  const url = new URL(str)

  url.searchParams.set('ticket', res.data.ticket)

  window.location.replace(`${url}`)
}

function isInIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

onMounted(() => {
  if (!isInIframe()) {
    console.log('不在iframe中')
    router()
  } else {
    console.log('在iframe中')
  }
})

const handleClick = (v: any) => {
  window.location.replace(v.url)
}
</script>

<template>
  <div class="app-container flex flex-col">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<style scoped lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--app-content-bg-color);

  .container-box-view {
    :deep(> div) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
