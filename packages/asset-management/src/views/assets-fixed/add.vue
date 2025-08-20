<script setup lang="tsx">
import { useRouter, useRoute } from 'vue-router'
import { BaseButton } from '@/components/Button'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { dataAssetsFixedAdd } from '@/api/assets-fixed'
import { ElMessage } from 'element-plus'
import { Form } from './ui'
import { ref } from 'vue'
const form = ref()
const { push, go } = useRouter()

const { query } = useRoute()

const handleClick = async () => {
  form.value?.submit().then((value: any) => {
    if (!value) return
    dataAssetsFixedAdd(value).then((res) => {
      if (res.code === 500001) {
        ElMessage.error('名称重复')
        return
      }

      if (res.code !== 200) {
        ElMessage.error(res.msg)
        return
      }
      go(-1)
    })
  })
}
</script>

<template>
  <ContentDetailWrap title="新增" @back="push('/assets/fixed')">
    <template #header>
      <BaseButton @click="go(-1)"> 返回 </BaseButton>
    </template>

    <Form ref="form" />

    <div class="flex justify-around">
      <BaseButton type="primary" @click="handleClick"> 保存 </BaseButton>
    </div>
  </ContentDetailWrap>
</template>
