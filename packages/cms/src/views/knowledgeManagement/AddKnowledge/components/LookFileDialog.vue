<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue'
import { Dialog } from '@/components/Dialog/index'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { propTypes } from '@/utils/propTypes'
import { ElMessageBox } from 'element-plus'
import { getFileName } from '@/utils'

const emit = defineEmits(['update:modelValue', 'close', 'submit'])

const props = defineProps({
  fileList: propTypes.arrayOf(propTypes.string),
  modelValue: {
    type: Boolean,
    default: () => false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'index',
    label: '序号',
    type: 'index',
    search: {
      hidden: true
    },
    form: {}
  },
  {
    field: 'title',
    label: '文件',
    search: {
      hidden: false
    },
    slots: {
      default: ({ row }: { row: any }) => {
        return getFileName(row.title)
      }
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
      default: ({ $index }: any) => {
        return (
          <>
            <BaseButton link type="danger" disabled={props.disabled} onClick={() => del($index)}>
              删除
            </BaseButton>
          </>
        )
      }
    }
  }
])

const fileDate = ref<{ title: string }[]>([])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      fileDate.value = (props.fileList || []).map((item) => {
        return {
          title: item as string
        }
      })
    } else {
      fileDate.value = []
    }
  }
)

const del = async (index: number) => {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    fileDate.value.splice(index, 1)
  })
}

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const submitAction = async () => {
  emit('submit', fileDate.value)
  dialogVisible.value = false
}

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<template>
  <Dialog v-model="dialogVisible" width="1000px">
    <template #title>
      <div>查看文件</div>
    </template>

    <Table :columns="allSchemas.tableColumns" :data="fileDate" />

    <template #footer>
      <BaseButton type="primary" @click="submitAction"> 保存 </BaseButton>
      <BaseButton type="default" @click="dialogVisible = false"> 取消 </BaseButton>
    </template>
  </Dialog>
</template>
