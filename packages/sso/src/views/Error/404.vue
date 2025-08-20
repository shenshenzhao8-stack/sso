<script setup lang="ts">
import { Error } from '@/components/Error'
import { usePermissionStore } from '@/stores/permission'
import { useRouter } from 'vue-router'

const { push } = useRouter()

const permissionStore = usePermissionStore()

const errorClick = () => {
  push('/')
}
</script>

<template>
  <Error @error-click="errorClick" />
</template>
