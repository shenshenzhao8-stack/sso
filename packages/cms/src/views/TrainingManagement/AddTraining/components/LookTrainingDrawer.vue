<template>
  <ElDrawer v-model:model-value="dialogVisible" size="50vw" :title="'培训内容'">
    <div class="exam-situation">
      <Form @register="formRegister" :schema="schema" :disabled="true" />

      <div class="flex justify-between">
        <div class="flex-1 m-r10px">
          <div class="m-b20px font-800 text-#8f9296">已参与人员</div>
          <Table
            :height="'60vh'"
            :columns="allSchemas.tableColumns"
            :data="editContent?.active_user_info || []"
          />
        </div>

        <div class="flex-1">
          <div class="m-b20px font-800 text-#8f9296">未参与人员</div>
          <Table
            :height="'60vh'"
            :columns="allSchemas.tableColumns"
            :data="[...(editContent?.un_active_user_info || [])]"
          />
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="tsx">
import { reactive, ref, computed } from 'vue'

import { Table } from '@/components/Table'

import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatTime, secondsToTime } from '@/utils'
import type { FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
const emit = defineEmits(['update:modelValue', 'close'])

const props = defineProps({
  modelValue: {
    type: Boolean
  },
  editContent: {
    type: Object,
    default: () => {}
  }
})

const { formRegister } = useForm()

const schema = ref<FormSchema[]>([
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    formItemProps: {
      slots: {
        default: (data) => {
          return <div>{props.editContent?.title || '--'}</div>
        }
      }
    }
  },
  {
    field: 'duration',
    label: '时长',
    component: 'Input',
    formItemProps: {
      slots: {
        default: (data) => {
          return (
            <div>
              {props.editContent?.duration ? secondsToTime(props.editContent.duration) : '--'}
            </div>
          )
        }
      }
    }
  },
  {
    field: 'description',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (data) => {
          return <div v-html={props.editContent?.content || '--'}></div>
        }
      }
    },
    label: '内容简介'
  }
])

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
    field: 'email',
    label: '邮箱',
    search: {
      hidden: false
    }
  },
  {
    field: 'name',
    label: '人员姓名',
    search: {
      hidden: false
    }
  },

  {
    field: 'start_time',
    label: '参与时间',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row?.start_time, 'yyyy-MM-dd HH:mm:ss')}</>
      }
    }
  }
])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)
</script>

<style lang="less" scoped>
.exam-situation {
  margin-top: 20px;

  :deep(.el-tabs__nav-scroll) {
    display: flex;
    justify-content: center;
  }
}
</style>
