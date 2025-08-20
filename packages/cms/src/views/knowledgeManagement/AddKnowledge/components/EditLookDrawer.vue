<template>
  <ElDrawer
    v-model:model-value="dialogVisible"
    body-class="bg-#efefef"
    size="100vw"
    v-bind="$attrs"
  >
    <template #header>
      <div>
        <div class="absolute">
          <BaseButton type="primary" @click="() => (dialogVisible = false)">
            <Icon icon="ep:arrow-left" />
            <span> 返回</span>
          </BaseButton>
        </div>
        <div class="text-center font-700">{{ title }}</div>
      </div>
    </template>
    <div class="flex justify-center"><Detail class="w-70vw" :echoData="echoData" /></div>
    <slot name="footer"></slot>
  </ElDrawer>
</template>

<script setup lang="tsx">
import Detail from './lookDate/detail.vue'
import { computed, watch } from 'vue'
import { Icon } from '@/components/Icon'
import { BaseButton } from '@/components/Button'

const props = defineProps({
  echoData: {
    type: Object,
    default: () => null
  },
  title: {
    type: String
  },
  modelValue: {
    type: Boolean
  }
})
const emit = defineEmits(['update:modelValue', 'close'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return
  },
  {
    immediate: true
  }
)
</script>
<style lang="less" scoped>
:deep(img) {
  -webkit-user-drag: none;
}
</style>
