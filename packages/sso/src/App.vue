<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ConfigGlobal } from '@/components/ConfigGlobal'
import { useDark } from '@vueuse/core'
import type { IMessage } from '@ff/utils'
import { localStorageHelper, IframeCommunicator } from '@ff/utils'

const communicator = new IframeCommunicator()

const appStore = useAppStore()

const currentSize = computed(() => appStore.getCurrentSize)

const isDark = useDark({
  valueDark: 'dark',
  valueLight: 'light'
})

isDark.value = appStore.getIsDark

onMounted(() => {
  communicator.onMessage(handleMessage)
})

onUnmounted(() => {
  communicator.removeMessageListener(handleMessage)
})

function handleMessage(message: IMessage) {
  if (message.type === 'logout') {
    console.log('退出登录')

    localStorageHelper.clear()
  }

  if (message.data) {
    const { token, refreshToken } = message.data
    localStorageHelper.set({
      key: 'token',
      value: `${token}`,
      expire: 30
    })

    localStorageHelper.set({
      key: 'refreshToken',
      value: refreshToken,
      expire: 2
    })
  }
}
</script>

<template>
  <ConfigGlobal :size="currentSize">
    <RouterView />
  </ConfigGlobal>
</template>

<style lang="less">
.size {
  width: 100%;
  height: 100%;
}

html,
body {
  padding: 0 !important;
  margin: 0;
  overflow: hidden;
  .size;

  #app {
    .size;
  }
}

.app-grey-mode {
  filter: grayscale(100%);
}
</style>
