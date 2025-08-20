<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import {
  getContentTagList,
  createContentTag,
  updateContentTag,
  deleteContentTag
} from '@/api/tag/index'
import { useTable } from '@/hooks/web/useTable'
import { Table, type TableColumn } from '@/components/Table'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import Write from './Write.vue'
import type { AddTagDto, UpdateTagDto } from '@/api/tag/type'
import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
import { Permission } from '@/components/Permission'
import { formatTime } from '@/utils/index'

const writeRef = ref<ComponentRef<typeof Write>>()
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getContentTagList({
      page: unref(currentPage),
      limit: unref(pageSize),
      ...searchParams.value
    })
    return {
      list: res.data.items || [],
      total: res.data.pagination.total || 0
    }
  }
})

const { dataList, loading, total, pageSize, currentPage } = tableState
const { getList } = tableMethods

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'name',
    label: '内容标签'
  },
  {
    field: 'created_at',
    label: '创建时间',
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.created_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'userName',
    label: '创建人',
    slots: {
      default: (data: any) => {
        const row = data.row
        if (row?.creator_info?.name) {
          return <ElTag type="success"> {row?.creator_info?.name}</ElTag>
        }
        return <></>
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    width: 240,
    slots: {
      default: (data: any) => {
        const row = data.row

        const result = [1, 2, 3, 4].findIndex((item) => item == row.id)
        if (result != -1) {
          return <></>
        }
        return (
          <>
            <Permission permission="PUT">
              <BaseButton type="primary" onClick={() => action(row, 'edit')}>
                编辑
              </BaseButton>
            </Permission>
            <Permission permission="DELETE">
              <BaseButton
                type="danger"
                onClick={() => {
                  ElMessageBox.confirm('删除不影响历史数据，确定删除该标签？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }).then(async () => {
                    deleteContentTag(row.id).then((res: any) => {
                      if (res.code === 200) {
                        ElMessage.success('删除成功')
                        getList()
                      } else {
                        ElMessage.error(res.msg)
                      }
                    })
                  })
                }}
              >
                删除
              </BaseButton>
            </Permission>
          </>
        )
      }
    }
  }
])

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '标签名称',
    component: 'Input'
  }
])

const searchParams = ref({})
const setSearchParams = (data: any) => {
  searchParams.value = data
  getList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref()
const actionType = ref('')

const saveLoading = ref(false)

const action = (row: any, type: string) => {
  dialogTitle.value = type === 'edit' ? '编辑' : '详情'
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const AddAction = () => {
  dialogTitle.value = '新增'
  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = ''
}

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    let promise: Promise<any> = Promise.resolve()
    if (actionType.value == 'edit') {
      promise = updateContentTag(formData as UpdateTagDto)
    } else {
      promise = createContentTag(formData as AddTagDto)
    }
    promise
      .then((res) => {
        if (res.code === 200) {
          ElMessage.success(dialogTitle.value + '内容标签成功')
          dialogVisible.value = false
          getList()
        } else if (res.code == 200001 || res.code == 50001 || res.code == 200201) {
          ElMessage.error('内容标签已存在，请重新修改后提交')
        } else {
          ElMessage.error(res.msg)
        }
      })
      .finally(() => {
        saveLoading.value = false
      })
  }
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @reset="setSearchParams" @search="setSearchParams" />
    <div class="mb-10px">
      <Permission permission="POST">
        <BaseButton type="primary" @click="AddAction">新增</BaseButton>
      </Permission>
    </div>
    <Table
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :columns="tableColumns"
      default-expand-all
      node-key="id"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total
      }"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle" :max-height="100" :width="500">
    <Write ref="writeRef" :current-row="currentRow" />
    <template #footer>
      <BaseButton
        v-if="actionType !== 'detail'"
        type="primary"
        :loading="saveLoading"
        @click="save"
      >
        保存
      </BaseButton>
      <BaseButton @click="dialogVisible = false">关闭</BaseButton>
    </template>
  </Dialog>
</template>
