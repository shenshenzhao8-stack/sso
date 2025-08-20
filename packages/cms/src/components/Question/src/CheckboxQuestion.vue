<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { computed, type PropType } from 'vue'

const props = defineProps({
  title: propTypes.string.def('题目标题'),
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  disabled: propTypes.bool.def(false),
  options: {
    type: Array as PropType<
      {
        label: string
        value: string
      }[]
    >,
    default: () => []
  }
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
  <div class="checkbox-choice-question">
    <div class="header flex cursor-default">
      <slot name="title">
        <div class="label flex mr-10px">[多选题]</div>
        <div class="name flex">{{ title }}</div>
      </slot>
    </div>
    <slot name="before"></slot>
    <div class="content">
      <el-checkbox-group v-model="radioValue" :disabled="disabled">
        <div class="flex items-center" v-for="(item, index) in options" :key="index">
          <el-checkbox :value="item.value">
            <slot :data="item">{{ item.label }}</slot>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
  </div>
</template>

<style lang="less" scoped>
.checkbox-choice-question {
  width: 100%;

  .header {
    margin: 10px 0;

    .label {
      white-space: nowrap;
    }

    > div {
      display: inline-block;
    }
  }

  .el-checkbox {
    display: flex;
    height: auto;
    align-items: flex-start;

    :deep(.el-checkbox__input) {
      display: flex;
      height: 30px;
      align-items: center;
    }

    :deep(.el-checkbox__label) {
      display: flex;
      width: 100%;
      font-weight: 400;
      line-height: 30px;
      color: initial !important;
      white-space: wrap;
    }
  }
}

.is-checked {
  :deep(.el-checkbox__inner) {
    background: var(--el-color-primary) !important;
    border-color: var(--el-color-primary) !important;

    &::after {
      border-color: var(--el-checkbox-checked-icon-color) !important;
    }
  }
}
</style>
