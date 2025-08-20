<script setup lang="ts">
import { ref } from 'vue'
import { ElMenu, ElMenuItem } from 'element-plus'
const handleSelect = (e: string) => {
  window.location.replace(e)
}

import { dataTopMenu } from './fetch'

function getSecondPathSegment(pathname: string) {
  const parts = pathname.split('/')
  if (parts.length > 1) {
    return parts[1]
  }
  return null
}

const data = ref()
const defaultActive = ref()
dataTopMenu().then((res) => {
  const result = getSecondPathSegment(window.location.pathname)

  defaultActive.value = `${window.location.origin}/${result}`

  if (res.code === 200) {
    data.value = res.data
  }
})
</script>
<template>
  <ElMenu
    mode="horizontal"
    class="w-full"
    :default-active="defaultActive"
    backgroundColor="var(--left-menu-bg-color)"
    textColor="var(--left-menu-text-color)"
    activeTextColor="var(--left-menu-text-active-color)"
  >
    <ElMenuItem
      :index="item.url"
      v-for="item in data"
      :key="item.key"
      @click="handleSelect(item.url)"
      >{{ item.name }}</ElMenuItem
    >
  </ElMenu>
</template>
