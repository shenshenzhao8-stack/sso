<script setup lang="tsx">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseButton } from '@/components/Button'
import {
  dataAssetsFixedDetail,
  dataAssetsFixedEdit,
  dataAssetsFixedRecordsDel
} from '@/api/assets-fixed'
import { ElCard, ElMessageBox, ElMessage, ElTag } from 'element-plus'
import { Table, type TableColumn } from '@/components/Table'
import { Form } from './ui'
import { handleDeprecatedClick, handleRevertClick, handleUseClick } from '@/ops/op-assets-fixed'
import { ASSETS_RECEIVE_STATUS } from '@/const'
import { find } from 'lodash-es'
import { formatTime } from '@/utils/index'
import { Permission } from '@/components/Permission'
import { useHandleDeleteClick } from '@/ops/op-assets-fixed'

const { push, go } = useRouter()

const { params, query } = useRoute()

const currentRow = ref()
const disabled = ref(query.op === 'detail')

const getDetail = () => {
  dataAssetsFixedDetail(params?.id as string)
    .then((res) => {
      currentRow.value = res.data
      tableDataList.value = res.data.record || []
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getDetail()
})
const handleCancelClick = () => {
  if (!disabled.value && query.op === 'detail') {
    disabled.value = true
    return
  }
  push('/assets/fixed')
}

const handleDeleteClick = useHandleDeleteClick(handleCancelClick)

const form = ref()
const handleEditClick = () => {
  if (!disabled.value) {
    form.value?.submit().then((value: any) => {
      if (!value) return

      dataAssetsFixedEdit(value).then((res) => {
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

const handleClick = (id: number) => {
  ElMessageBox.confirm('确定删除该数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataAssetsFixedRecordsDel(id).then((res) => {
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
    field: 'user.name',
    label: '当前使用人'
  },
  {
    field: 'user.id',
    label: '工号',
    slots: {
      default: ({ row }) => {
        return <>{row.user?.id ? row.user?.id : ''}</>
      }
    }
  },
  {
    label: '合同归属',
    field: 'user.contract'
  },
  {
    field: 'status',
    label: '状态',
    slots: {
      default: ({ row }) => {
        const statusItem = find(ASSETS_RECEIVE_STATUS, { value: row.status })
        return <ElTag type={statusItem?.type as any}>{statusItem?.label}</ElTag>
      }
    }
  },
  {
    field: 'updated_at',
    label: '更新时间',
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.updated_at, 'yyyy-MM-dd HH:mm:ss')}</>
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
            <BaseButton type="danger" onClick={() => handleClick(row.id)}>
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
      <div class="flex justify-between m-b" v-if="disabled">
        <p>物品领用/归还/报废记录</p>
        <div class="m-b">
          <Permission permission="PUT">
            <BaseButton
              type="info"
              plain
              @click="handleDeprecatedClick(currentRow, getDetail)"
              :disabled="currentRow?.status === 3 || currentRow?.status === 2"
            >
              资产报废
            </BaseButton>
            <BaseButton
              type="warning"
              plain
              @click="handleUseClick(currentRow.id, getDetail)"
              :disabled="currentRow?.status === 3"
            >
              资产领用
            </BaseButton>
            <BaseButton
              type="danger"
              plain
              @click="handleRevertClick(currentRow, getDetail)"
              :disabled="currentRow?.status === 3 || currentRow?.status === 1"
            >
              资产归还
            </BaseButton>
          </Permission>
        </div>
      </div>

      <Table :columns="columns" :data="tableDataList" :loading="loading" v-if="disabled" />
    </div>

    <template #footer>
      <div class="flex">
        <Permission permission="POST">
          <BaseButton type="primary" @click="handleEditClick">
            {{ disabled ? '编辑' : '提交' }}
          </BaseButton>
        </Permission>
        <BaseButton plain @click="handleCancelClick"> 关闭 </BaseButton>
        <Permission permission="DELETE">
          <BaseButton
            plain
            type="danger"
            @click="() => handleDeleteClick(currentRow)"
            :disabled="currentRow?.status === 2"
          >
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
