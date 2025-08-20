<template>
  <div>
    <ContentWrap>
      <div class="text-18px font-600">{{ detailData.title ?? '' }}</div>
      <div class="mt-20px flex justify-between items-center">
        <div class="flex">
          <div class="text-14px">
            {{
              '业务标签：' +
              (detailData.business_tags?.map((item: any) => item.name).join('、') ?? '')
            }}
          </div>
          <div class="text-14px ml-20px">
            {{
              '内容标签：' +
              (detailData.content_tags?.map((item: any) => item.name).join('、') ?? '')
            }}
          </div>
        </div>
        <div class="text-12px text-#757575">
          {{ '提交时间：' + formatTime(detailData.created_at ?? 0, 'yyyy年MM月dd日') }}
        </div>
      </div>
    </ContentWrap>
    <ContentWrap class="mt-20px" v-if="htmlHasContent(detailData.content)">
      <div class="line-height-35px content-text">
        <div v-html="detailData.content ?? ''"></div>
      </div>
    </ContentWrap>
    <ContentWrap class="mt-20px" v-if="detailData.attachment_file_list?.length">
      <div class="flex items-center">
        <div class="font-600">附件下载</div>
        <div class="text-14px text-#757575">（点击下载附件）</div>
      </div>
      <div class="mt-20px">
        <el-button
          v-for="item in detailData.attachment_file_list"
          :key="item"
          type="primary"
          plain
          @click="downloadFile(item)"
        >
          {{ getFileName(item) }}
        </el-button>
      </div>
    </ContentWrap>
  </div>
</template>

<script lang="ts" setup>
import { type PropType } from 'vue'
import { ContentWrap } from '@/components/ContentWrap/index'
import { ElButton } from 'element-plus'

import { formatTime, getFileName, htmlHasContent } from '@/utils/index'
import axios from 'axios'

defineProps({
  detailData: {
    type: Object as PropType<any>,
    default: () => ({})
  }
})

const downloadFile = (url: string) => {
  axios
    .get(url, {
      responseType: 'blob'
    })
    .then((res) => {
      const download_url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = download_url
      a.download = getFileName(url)
      a.click()
    })
}
</script>

<style scoped lang="less">
:deep(.el-card__body) {
  height: 100%;
  background-color: #fafafa;
}

:deep(.el-button, .el-button.is-round) {
  padding: 12px 35px;
}

.content-text {
  word-wrap: break-word;
  white-space: normal;

  :deep(img) {
    width: 100%;
  }

  :deep(video) {
    width: 100%;
  }
}
</style>
