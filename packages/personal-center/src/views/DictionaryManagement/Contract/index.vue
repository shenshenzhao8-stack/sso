<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog/index'
import Write from '@/views/DictionaryManagement/Contract/components/Write.vue'
import { useTable } from '@/hooks/web/useTable'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { getDictListApi, createDictApi, deleteDictApi, updateDictApi } from '@/api/dictionary/index'
import { type DictItemType } from '@/api/dictionary/types'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/index'

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getDictListApi({
      page: unref(currentPage),
      limit: unref(pageSize),
      type: 1,
      ...unref(searchParams)
    })
    res.data.result?.forEach((item: DictItemType) => {
      item.created_at = formatTime(item.created_at, 'yyyy/MM/dd HH:mm:ss')
    })
    return {
      list: res.data?.result ?? [],
      total: res.data?.pagination?.total ?? 0
    }
  },
  fetchDelApi: async () => {
    if (!currentRow.value?.id) {
      ElMessage.error('删除失败')
      return false
    }
    const res = await deleteDictApi({ id: currentRow.value?.id })
    if (res.code === 102001) {
      ElMessage.error('该合同归属已被引用，无法删除')
    } else if (res.code !== 200) {
      ElMessage.error('删除失败')
    } else {
      ElMessage.success('删除成功')
    }
    return res.code === 200
  }
})

const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, delList } = tableMethods

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: '序号',
    search: {
      hidden: true
    },
    table: {
      type: 'index'
    }
  },
  {
    field: 'name',
    label: '合同归属',
    search: {
      component: 'Input',
      label: ' ',
      componentProps: {
        placeholder: '请输入归属名称查询',
        style: {
          width: '200px'
        }
      }
    }
  },
  {
    field: 'created_at',
    label: '创建时间',
    search: {
      hidden: true
    }
  },
  {
    field: 'creator_info.name',
    label: '创建人',
    search: {
      hidden: true
    }
  },
  {
    field: 'action',
    label: '操作',
    search: {
      hidden: true
    },
    table: {
      width: 240,
      slots: {
        default: (data: any) => {
          const row = data.row as DictItemType
          return (
            <>
              <BaseButton type="primary" onClick={() => editAction(row)}>
                编辑
              </BaseButton>
              <BaseButton
                loading={unref(delLoading)}
                type="danger"
                onClick={() => deleteAction(row)}
              >
                删除
              </BaseButton>
            </>
          )
        }
      }
    }
  }
])
// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const searchParams = ref({})
const currentRow = ref<DictItemType>()
const delLoading = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const writeRef = ref<ComponentRef<typeof Write>>()
const showAddOrEditDialog = ref(false)
const submitLoading = ref(false)

const searchAction = (params: any) => {
  searchParams.value = {
    name: params.name
  }
  getList()
}

const addAction = () => {
  currentRow.value = undefined
  dialogType.value = 'add'
  showAddOrEditDialog.value = true
}

const editAction = (row: DictItemType) => {
  dialogType.value = 'edit'
  currentRow.value = row
  showAddOrEditDialog.value = true
}

const submitAction = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    submitLoading.value = true
    if (dialogType.value === 'add') {
      const res = await createDictApi({ name: formData.name, type: 1 })
      submitLoading.value = false
      if (res.code === 200) {
        showAddOrEditDialog.value = false
        ElMessage.success('新增合同归属成功')
        getList()
      } else if (res.code == 100001) {
        ElMessage.error('合同归属名称已存在')
      } else {
        ElMessage.error('提交失败')
      }
    } else {
      if (!currentRow.value?.id) {
        submitLoading.value = false
        return
      }
      const res = await updateDictApi({ name: formData.name, id: currentRow.value.id })
      submitLoading.value = false
      if (res.code === 200) {
        showAddOrEditDialog.value = false
        ElMessage.success('编辑合同归属成功')
        getList()
      } else if (res.code == 100001) {
        ElMessage.error('合同归属名称已存在')
      } else {
        ElMessage.error('提交失败')
      }
    }
  }
}

const deleteAction = async (row: DictItemType) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}
</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="searchAction" @reset="searchAction" />
    <div class="mb-10px">
      <BaseButton type="primary" @click="addAction">新增</BaseButton>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      @register="tableRegister"
    />
    <Dialog
      v-model="showAddOrEditDialog"
      :title="dialogType === 'add' ? '新增' : '编辑'"
      width="600"
      :max-height="100"
    >
      <Write ref="writeRef" :current-row="currentRow" />
      <template #footer>
        <BaseButton type="primary" @click="submitAction" :loading="submitLoading">确认</BaseButton>
        <BaseButton @click="showAddOrEditDialog = false">取消</BaseButton>
      </template>
    </Dialog>
  </ContentWrap>
</template>
