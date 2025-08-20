<script setup lang="tsx">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseButton } from '@/components/Button'
import {
  dataAssetsConsumablesDetail,
  dataAssetsConsumablesEdit,
  dataAssetsConsumablesRecordsDelete
} from '@/api/assets-consumables'
import { ElCard, ElMessageBox, ElMessage } from 'element-plus'
import { Table, type TableColumn } from '@/components/Table'
import { ASSETS_STOCK_STATUS } from '@/const'
import { find } from 'lodash-es'
import { formatTime } from '@/utils/index'
import { useHandleEnterClick, useHandleOutClick } from '@/ops/op-assets-consumables'
import Form from './ui/from.vue'
import { Permission } from '@/components/Permission'
import { useHandleDeleteClick } from '@/ops/op-assets-consumables'

const { push, go } = useRouter()

const { params, query } = useRoute()

const currentRow = ref()
const disabled = ref(query.op === 'detail')

const getDetail = () => {
  dataAssetsConsumablesDetail(Number(params?.id))
    .then((res) => {
      currentRow.value = res.data
      tableDataList.value = res.data.inventory_record_list || []
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getDetail()
})

const handleEnterClick = useHandleEnterClick(getDetail)
const handleOutClick = useHandleOutClick(getDetail)

const handleCancelClick = () => {
  if (!disabled.value && query.op === 'detail') {
    disabled.value = true
    return
  }

  push('/assets/consumables')
}

const handleDelClick = useHandleDeleteClick(handleCancelClick)
const form = ref()
const handleEditClick = () => {
  if (!disabled.value) {
    form.value?.submit().then((value: any) => {
      if (!value) return

      dataAssetsConsumablesEdit(value).then((res) => {
        if (res.code === 500001) {
          ElMessage.error('名称重复')
          return
        }

        if (res.code !== 200) {
          ElMessage.error(res.data.msg)
          return
        }

        getDetail()
        disabled.value = true
      })
    })
  }

  disabled.value = false
}

const loading = ref(true)

const tableDataList = ref([])

const handleRecordClick = (id: number) => {
  ElMessageBox.confirm('确定删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataAssetsConsumablesRecordsDelete(id).then((res) => {
      if (res.code !== 200) {
        ElMessage.error(res.data.msg)
        return
      }
      ElMessage.success('删除成功')
      getDetail()
    })
  })
}

const columns: TableColumn[] = [
  {
    field: 'index',
    label: '序号',
    type: 'index'
  },
  {
    field: 'status',
    label: '状态',
    slots: {
      default: ({ row }) => {
        const statusItem = find(ASSETS_STOCK_STATUS, { value: row.status })
        return <span>{statusItem?.label}</span>
      }
    }
  },
  {
    field: 'stock_num',
    label: '出/入库数量'
  },
  {
    label: '领用人',
    field: 'receiver_name'
  },
  {
    field: 'creator_name',
    label: '管理员'
  },
  {
    field: 'created_at',
    label: '出入库时间',
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.created_at, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  },
  {
    field: 'action',
    label: '操作',
    slots: {
      default: ({ row }) => {
        return (
          <Permission permission="DELETE">
            <BaseButton type="danger" onClick={() => handleRecordClick(row.id)}>
              删除
            </BaseButton>
          </Permission>
        )
      }
    }
  }
]
</script>

<template>
  <ElCard
    title="详情"
    class="content flex flex-col"
    body-class="flex-1"
    @back="push('/assets/fixed')"
  >
    <template #header>
      <BaseButton @click="go(-1)"> 返回 </BaseButton>
    </template>
    <div>
      <Form ref="form" :data="currentRow" :disabled="disabled" />
      <div v-if="disabled">
        <div class="flex justify-between m-b">
          <p>物品出库/入库记录</p>
          <div>
            <Permission permission="POST">
              <BaseButton type="success" plain @click="handleOutClick(Number(params?.id))">
                出库
              </BaseButton>
              <BaseButton type="success" plain @click="handleEnterClick(Number(params?.id))">
                入库
              </BaseButton>
            </Permission>
          </div>
        </div>
        <Table :columns="columns" :data="tableDataList" :loading="loading" />
      </div>
    </div>
    <template #footer>
      <div class="flex">
        <Permission permission="PUT">
          <BaseButton type="primary" @click="handleEditClick">
            {{ disabled ? '编辑' : '提交' }}
          </BaseButton>
        </Permission>
        <BaseButton plain @click="handleCancelClick"> 关闭 </BaseButton>
        <Permission permission="DELETE">
          <BaseButton plain type="danger" @click="() => handleDelClick(currentRow?.id)">
            删除
          </BaseButton>
        </Permission>
      </div>
    </template>
  </ElCard>
</template>
<style scoped>
.content {
  height: 84vh;
  overflow: auto;
}
</style>
