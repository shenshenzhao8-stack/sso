<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import { computed } from 'vue'

const props = defineProps({
  title: propTypes.string.def('题目标题'),
  modelValue: propTypes.string.def(''),
  disabled: propTypes.bool.def(false)
})

const emit = defineEmits(['update:modelValue'])

const radioValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})
</script>

<template>
  <div class="essay-choice-question">
    <div class="header flex cursor-default">
      <slot name="title">
        <div class="label flex mr-10px">[问答题]</div>
        <div class="name flex">{{ title }}</div>
      </slot>
    </div>
    <div class="content mt-10px">
      <el-input v-model="radioValue" type="textarea" :disabled="disabled" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.essay-choice-question {
  .header {
    margin: 10px 0;

    .label {
      white-space: nowrap;
    }

    > div {
      display: inline-block;
    }
  }

  :deep(.el-textarea__inner) {
    color: initial !important;
  }
}
</style>
