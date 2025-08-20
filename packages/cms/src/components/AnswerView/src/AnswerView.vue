<template>
  <div class="flex flex-wrap">
    <div
      class="flex flex-wrap"
      v-for="item in answerInfos"
      :key="item.id"
      @click="(e) => e.stopPropagation()"
    >
      {{ (item.number ?? '') + (item.number ? '：' : '') + (item.answer ?? '') }}
      <ElImage
        v-if="item.annex?.length"
        class="h-[20px] w-[20px] mr-10px"
        :src="item.annex"
        fit="cover"
        :preview-src-list="[item.annex]"
        preview-teleported
      />
      {{ '；' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElImage } from 'element-plus'
import { type AnswerInfoType } from '@/api/question/type'

const props = withDefaults(
  defineProps<{
    answerInfos?: AnswerInfoType[]
  }>(),
  {
    answerInfos: undefined
  }
)
</script>
