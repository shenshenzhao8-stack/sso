<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ConfigGlobal } from '@/components/ConfigGlobal'
import { useDark } from '@vueuse/core'
import { useMenuStore } from './stores/menuView'
import { createIframeCommunicator } from '@/utils/communicator'

const menuStore = useMenuStore()
const appStore = useAppStore()

const currentSize = computed(() => appStore.getCurrentSize)

const greyMode = computed(() => appStore.getGreyMode)

const isDark = useDark({
  valueDark: 'dark',
  valueLight: 'light'
})

const routers: any = [
  {
    path: '/user-management',
    title: '用户管理',
    name: 'UserManagement',
    icon: 'mdi:user-multiple',
    children: null
  },
  {
    path: '/department-management',
    title: '部门管理',
    name: 'DepartmentManagement',
    icon: 'material-symbols:account-tree',
    children: null
  },
  {
    path: '/permission-management',
    title: '权限管理',
    name: 'PermissionManagement',
    icon: 'material-symbols:person-check-outline',
    children: null
  },
  {
    path: '/dictionary-configuration',
    title: '配置字典',
    name: 'DictionaryConfiguration',
    icon: 'material-symbols:settings-cinematic-blur-outline-sharp',
    children: [
      {
        path: 'contract/list',
        title: '合同归属',
        name: 'ContractList'
      },
      // {
      //   path: 'l2department/list',
      //   title: 'L2部门',
      //   name: 'L2departmentList'
      // },
      {
        path: 'project/list',
        title: '项目名称',
        name: 'ProjectList'
      }
    ]
  }
]

isDark.value = appStore.getIsDark

onMounted(() => {
  const menuList = menuStore.initMenuRouter(routers)
  menuStore.setMenuList(menuList)

  createIframeCommunicator()
})
</script>

<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `app-grey-mode` : ''" />
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
