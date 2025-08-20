<script setup lang="tsx">
import { ref, unref, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { ElMessage } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Table } from '@/components/Table'
import { useTable } from '@/hooks/web/useTable'
import Write from '@/views/Department/components/Write.vue'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import {
  getDepartmentLevelListApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  getDepartmentDetailApi
} from '@/api/department'
import type { DepartmentItem } from '@/api/department/types'
import { formatTime } from '@/utils/index'

const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref<DepartmentItem | null>(null)
const actionType = ref<'add' | 'edit'>('add')
const saveLoading = ref(false)
const delLoading = ref(false)
const writeRef = ref<ComponentRef<typeof Write>>()
const expandRowKeys = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getDepartmentLevelListApi()
    formatCreateTime(res.data?.result ?? [])
    return {
      list: res.data?.result ?? [],
      total: res.data?.result?.length ?? 0
    }
  },
  fetchDelApi: async () => {
    if (!currentRow.value?.id) {
      ElMessage.error('删除失败')
      return false
    }
    const res = await deleteDepartmentApi({ id: currentRow.value?.id })
    if (res.code === 104001) {
      ElMessage.error('部门被使用，无法删除')
    } else if (res.code === 104002) {
      ElMessage.error('部门被子部门使用，无法删除')
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
    type: 'index'
  },
  {
    field: 'name',
    label: '部门名称'
  },
  {
    field: 'head_user_info.name',
    label: '直属领导'
  },
  {
    field: 'head_user_info.email',
    label: '直属领导邮箱'
  },
  {
    field: 'head_user_info.number',
    label: '直属领导工号'
  },
  {
    field: 'created_at',
    label: '创建时间'
  },
  {
    field: 'action',
    width: '260px',
    label: '操作',
    table: {
      slots: {
        default: (data: any) => {
          return (
            <>
              <BaseButton type="primary" onClick={() => editAction(data.row)}>
                编辑
              </BaseButton>
              <BaseButton type="danger" onClick={() => deleteAction(data.row)}>
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

const formatCreateTime = (departments: any[]) => {
  departments.forEach((department) => {
    if (department.created_at) {
      department.created_at = formatTime(department.created_at, 'yyyy/MM/dd HH:mm:ss')
    }
    if (department.children) {
      formatCreateTime(department.children)
    }
  })
}

const addAction = () => {
  dialogTitle.value = '新增部门'
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = 'add'
}

const editAction = (row: DepartmentItem) => {
  dialogTitle.value = '编辑部门'
  actionType.value = 'edit'
  currentRow.value = row
  dialogVisible.value = true
}

const saveAction = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    if (actionType.value === 'add') {
      saveLoading.value = true
      const res = await createDepartmentApi({
        ...formData,
        parent_department_id: formData?.parent_department_id ?? 0
      })
      saveLoading.value = false
      if (res.code === 200) {
        ElMessage.success('新增部门成功')
        const detailRes = await getDepartmentDetailApi({ id: res.data?.id })
        if (detailRes.code === 200) {
          expandRowKeys.value = (detailRes.data?.department_level_ids ?? []).map((item) =>
            item.toString()
          )
        }
        getList()
        dialogVisible.value = false
      } else if (res.code == 100001) {
        ElMessage.error('部门名称已存在')
      } else if (res.code == 104000) {
        ElMessage.error('上级部门不能是当前部门或子部门')
      } else {
        ElMessage.error('提交失败')
      }
    } else {
      if (!currentRow.value?.id) {
        ElMessage.error('编辑部门失败')
        return
      }
      saveLoading.value = true
      const res = await updateDepartmentApi({
        ...formData,
        parent_department_id: formData?.parent_department_id ?? 0,
        id: currentRow.value?.id
      })
      saveLoading.value = false
      if (res.code === 200) {
        ElMessage.success('编辑部门成功')
        const detailRes = await getDepartmentDetailApi({ id: res.data?.id })
        if (detailRes.code === 200) {
          expandRowKeys.value = (detailRes.data?.department_level_ids ?? []).map((item) =>
            item.toString()
          )
        }
        getList()
        dialogVisible.value = false
      } else if (res.code == 100001) {
        ElMessage.error('部门名称已存在')
      } else if (res.code == 104000) {
        ElMessage.error('上级部门不能是当前部门或子部门')
      } else {
        ElMessage.error('提交失败')
      }
    }
  }
}

const deleteAction = async (row: DepartmentItem) => {
  currentRow.value = row
  delLoading.value = true
  await delList(1).finally(() => {
    delLoading.value = false
  })
}
</script>

<template>
  <ContentWrap>
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
      row-key="id"
      :expand-row-keys="expandRowKeys"
      @register="tableRegister"
    />
  </ContentWrap>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write ref="writeRef" :current-row="currentRow" />
    <template #footer>
      <BaseButton type="primary" :loading="saveLoading" @click="saveAction">保存</BaseButton>
      <BaseButton @click="dialogVisible = false">关闭</BaseButton>
    </template>
  </Dialog>
</template>
