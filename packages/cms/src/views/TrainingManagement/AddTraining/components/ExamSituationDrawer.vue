<template>
  <ElDrawer v-model:model-value="dialogVisible" size="50vw" :title="'查看结果'" @close="close">
    <div class="exam-situation">
      <ExamSituation
        ref="examSituationRef"
        :id="id"
        :echo-data="echoData"
        :defalutMenuId="13"
        :default-active-tab="defaultActiveTab"
        :create-user-id="createUserId"
      />
    </div>
  </ElDrawer>
</template>

<script setup lang="tsx">
import { ref, computed } from 'vue'

import ExamSituation from '@/views/ExaminationManagement/AddExamination/components/ExamSituation.vue'
const emit = defineEmits(['update:modelValue', 'close'])

const examSituationRef = ref<InstanceType<typeof ExamSituation>>()

const props = defineProps({
  modelValue: {
    type: Boolean
  },
  echoData: {
    type: Object,
    default: () => {}
  },
  id: {
    type: String,
    default: ''
  },
  defaultActiveTab: {
    type: String,
    default: ''
  },
  createUserId: {
    type: Number,
    default: -1
  }
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const close = () => {
  emit('close')
}
</script>

<style lang="less" scoped></style>
