<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'
import { ElRadio, ElRadioGroup } from 'element-plus'
import { computed, type PropType } from 'vue'

const props = defineProps({
  title: propTypes.string.def('题目标题'),
  modelValue: {
    type: String,
    default: ''
  },
  disabled: propTypes.bool.def(false),
  options: {
    type: Array as PropType<
      {
        label: string
        value: boolean
      }[]
    >,
    default: () => [
      {
        label: '正确',
        value: true
      },
      {
        label: '错误',
        value: false
      }
    ]
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
  <div class="judge-choice-question">
    <div class="header flex cursor-default">
      <slot name="title">
        <div class="label flex mr-10px">[判断题]</div>
        <div class="name flex">{{ title }}</div>
      </slot>
    </div>
    <div class="content">
      <el-radio-group v-model="radioValue" :disabled="disabled">
        <div class="flex items-center" v-for="(item, index) in options" :key="index">
          <el-radio :value="item.value">
            <slot :data="item">{{ item.label }}</slot>
          </el-radio>
        </div>
      </el-radio-group>
    </div>
  </div>
</template>

<style lang="less" scoped>
.judge-choice-question {
  .header {
    margin: 10px 0;

    .label {
      white-space: nowrap;
    }

    > div {
      display: inline-block;
    }
  }

  .el-radio {
    display: flex;
    height: auto;
    // align-items: flex-start;
    line-height: 30px;
    white-space: wrap;

    :deep(.el-radio__input) {
      display: flex;
      height: 30px;
      align-items: center;
    }

    :deep(.el-radio__label) {
      font-weight: 400;
      color: initial !important;
    }
  }
}

.is-checked {
  :deep(.el-radio__inner) {
    background: var(--el-color-primary) !important;
    border-color: var(--el-color-primary) !important;

    &::after {
      background-color: var(--el-color-white) !important;
      border-radius: var(--el-radio-input-border-radius) !important;
    }
  }
}
</style>
