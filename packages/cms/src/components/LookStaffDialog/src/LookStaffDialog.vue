<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { Table } from '@/components/Table'
import { Search } from '@/components/Search'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import type { PropType } from 'vue-types/dist/types'
import { ElMessageBox } from 'element-plus'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  modelValue: {
    type: Boolean
  },
  dialogTitle: {
    type: String,
    default: '参加人员名单'
  },
  // 列表
  dataList: {
    type: Array as PropType<any[]>,
    default: (data: any) => {
      return []
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index',
    search: {
      hidden: true
    }
  },
  {
    field: 'email',
    label: '邮箱',
    searchable: true,
    search: {
      hidden: false,
      label: '搜索',
      componentProps: {
        placeholder: '请输入邮箱或姓名'
      }
    }
  },
  {
    field: 'name',
    width: '260px',
    label: '姓名',
    search: {
      hidden: true
    }
  },
  {
    field: 'action',
    width: '260px',
    label: '操作',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: { row: any }) => {
        if (row.isDel) {
          return (
            <BaseButton
              type="primary"
              disabled={props.disabled}
              link
              onClick={() => (row.isDel = false)}
            >
              恢复
            </BaseButton>
          )
        } else {
          return (
            <BaseButton type="danger" disabled={props.disabled} link onClick={() => delData(row)}>
              删除
            </BaseButton>
          )
        }
      }
    }
  }
])
const tableList = ref<any[]>([])

const searchParams = ref({
  email: ''
})
const setSearchParams = (params: any) => {
  searchParams.value = params
}

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const delData = async (row: any | null) => {
  ElMessageBox.confirm('确定删除该用户?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      row.isDel = true
    })
    .catch(() => {})
}

const list = computed(() => {
  if (!searchParams.value.email) return tableList.value
  return tableList.value.filter((item: any) => {
    return (
      item.email.includes(searchParams.value.email) || item.name.includes(searchParams.value.email)
    )
  })
})

const handleLock = async () => {
  const list = tableList.value.filter((item: any) => {
    return !item.isDel
  })
  emit('save', list)
  dialogVisible.value = false
  tableList.value = []
}

watch(
  () => dialogVisible.value,
  () => {
    if (dialogVisible.value) {
      searchParams.value = {
        email: ''
      }
      tableList.value = cloneDeep(props.dataList)
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog
    v-model="dialogVisible"
    width="60%"
    max-height="500px"
    class="lock-dialog"
    :title="dialogTitle"
  >
    <Search :schema="allSchemas.searchSchema" @reset="setSearchParams" @search="setSearchParams" />

    <Table :columns="allSchemas.tableColumns" :data="list" :loading="loading" />

    <template #footer>
      <BaseButton type="primary" @click="handleLock" v-if="!disabled">更新</BaseButton>
      <BaseButton @click="dialogVisible = false">取消</BaseButton>
    </template>
  </Dialog>
</template>
