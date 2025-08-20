<template>
  <div>
    <ContentWrap v-if="isRelated">
      <div class="font-600">相关内容</div>
      <div>
        <div
          class="cursor-pointer border-b-dotted border-b-gray mt-20px pb-10px"
          v-for="item in relatedData"
          :key="item.id"
          @click="() => $emit('relatedDataClick', item)"
        >
          {{ item.title ?? '' }}
          <div class="mt-10px text-12px text-#757575">
            {{ `发布时间：${formatTime(item.created_at ?? 0, 'yyyy年MM月dd日')}` }}
          </div>
        </div>
      </div>
    </ContentWrap>
    <ContentWrap v-else>
      <div class="font-600">事件处理进度</div>
      <div class="mt-20px">
        <el-steps direction="vertical" :active="detailData.process_schedule_list?.length || 0">
          <el-step v-for="item in detailData.process_schedule_list" :key="item.id">
            <template #icon>
              <!-- <img class="w-10px h-10px" src="@/assets/imgs/dot-icon.png" alt="" /> -->
            </template>
            <template #description>
              <div class="text-black text-14px">
                <div class="mb-5px">
                  {{ '处理人：' + (item.processors?.map((p: any) => p.name)?.join('、') ?? '') }}
                </div>
                <div class="mb-5px">
                  {{ '处理状态：' + getProcessStateText(item.process_state) }}
                </div>
                <div class="mb-5px">{{ '处理意见：' + item.process_content }}</div>
                <div class="mb-5px">
                  {{ '提交时间：' + formatTime(item.process_at ?? 0, 'yyyy年MM月dd日 HH:mm:ss') }}
                </div>
                <div class="mb-25px flex flex-wrap">
                  <ElImage
                    v-for="img_url in item.attachment_file_list"
                    :key="img_url"
                    class="w-[calc((100%-30px)/3)] aspect-ratio-1 object-cover mr-10px mb-10px"
                    :src="img_url"
                    fit="cover"
                    :preview-src-list="[img_url]"
                    preview-teleported
                  />
                </div>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>
    </ContentWrap>
  </div>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue'
import { ContentWrap } from '@/components/ContentWrap/index'
import { ElSteps, ElStep, ElImage } from 'element-plus'

import { formatTime } from '@/utils/index'

defineProps({
  isRelated: {
    type: Boolean,
    default: true
  },
  detailData: {
    type: Object,
    default: () => ({})
  },
  relatedData: {
    type: Array as PropType<any[]>,
    default: () => []
  }
})

defineEmits(['relatedDataClick'])

const getProcessStateText = (state: number) => {
  switch (state) {
    case 1:
      return '同意'
    case 2:
      return '不同意'
    case 3:
      return '结束事件'
    default:
      return ''
  }
}
</script>
