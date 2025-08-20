<template>
  <div class="h-[calc(var(--view-context-height)-(var(--el-card-padding)*2)-59px)] overflow-hidden">
    <el-scrollbar>
      <div class="flex justify-center">
        <Left class="w-70%" :detail-data="echoData || {}" />
        <Right
          v-if="isRelated"
          class="flex-1 ml-20px"
          :is-related="!isRelated"
          :detail-data="echoData || {}"
          :related-data="relatedDataBankList"
          @related-data-click="relatedDataClick"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElScrollbar } from 'element-plus'

import Left from './components/Left.vue'
import Right from './components/Right.vue'

const props = defineProps({
  echoData: {
    type: Object,
    default: () => null
  }
})

const isRelated = computed(() => {
  return props.echoData?.process_schedule_list?.length > 0
})

const relatedDataBankList = ref<any[]>([])

const relatedDataClick = (item: any) => {}
</script>

<style lang="less" scoped>
.el-card {
  background-color: #efefef;
}
</style>
