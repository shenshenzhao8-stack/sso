<template>
  <ContentWrap class="px-150px">
    <BaseButton class="pos-absolute w-40px left-40px top-40px" @click="router.go(-1)">
      返回
    </BaseButton>
    <div
      class="h-[calc(var(--view-context-height)-(var(--el-card-padding)*2)-2px-51px)] overflow-hidden"
    >
      <el-scrollbar max-height="100%" class="bg-white">
        <div class="bg-white min-h-800px w-100%">
          <div class="p-20px font-bold text-26px line-clamp-2">
            {{ detailData?.title }}
          </div>
          <div class="flex text-16px justify-between p-20px">
            <div class="flex">
              <div>
                业务标签：{{
                  detailData?.business_tags?.map((tag: TagInfoType) => tag.name).join('、')
                }}
              </div>
              <div class="ml-20px">
                内容标签：{{
                  detailData?.content_tags?.map((tag: TagInfoType) => tag.name).join('、')
                }}
              </div>
            </div>

            <div>发布时间：{{ formatTime(detailData?.created_at ?? 0, 'yyyy-MM-dd ') }}</div>
          </div>
          <div class="p-20px">
            <div class="text-18px mt-15px content-text" v-html="detailData?.content"></div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div v-if="detailPageHasHandlePermission(9)" class="px-20px">
      <div class="h-[1px] bg-[#409eff]"></div>
    </div>
    <div v-if="detailPageHasHandlePermission(9)" class="h-[50px] pt-20px px-20px">
      <BaseButton type="primary" @click="editAction">编辑</BaseButton>
      <BaseButton type="danger" @click="deleteAction">删除</BaseButton>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ContentWrap } from '@/components/ContentWrap'
import { getNewsDetailApi, deleteNewsApi } from '@/api/content/index'
import { detailPageHasHandlePermission, formatTime } from '@/utils'
import type { ContentItemType } from '@/api/content/types'
import type { TagInfoType } from '@/api/tag/type'
import { ElMessage, ElScrollbar, ElMessageBox } from 'element-plus'
import { BaseButton } from '@/components/Button'

const router = useRouter()
const route = useRoute()
const detailData = ref<ContentItemType>()

onMounted(() => {
  if (route.query?.id) {
    getDetail()
  }
})

const getDetail = async () => {
  const res = await getNewsDetailApi({
    id: Number(route.query?.id)
  })
  if (res.code === 200) {
    detailData.value = res.data
  } else {
    ElMessage.error('获取资讯详情失败')
  }
}

const editAction = () => {
  router.push({
    path: '/content-management/edit',
    query: {
      id: route.query?.id
    }
  })
}

const deleteAction = () => {
  ElMessageBox.confirm('确定删除该资讯吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteNewsApi({
      id: Number(route.query?.id)
    })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      router.replace('/content-management/list')
    } else {
      ElMessage.error('删除失败')
    }
  })
}
</script>

<style scoped lang="less">
:deep(.el-card__body) {
  height: 100%;
  background-color: #fff;
}

:deep(.el-button, .el-button.is-round) {
  padding: 12px 35px;
}

.content-text {
  :deep(img) {
    width: 100% !important;
    height: auto !important;
  }

  :deep(video) {
    width: 100%;
  }

  :deep(p) {
    margin-top: 20px;
  }
}
</style>
