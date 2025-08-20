<template>
  <div class="exam-situation">
    <LookTrainingDrawer
      v-if="showDrawer"
      ref="lookTrainingDrawerRef"
      v-model:model-value="showDrawer"
      :editContent="drawerData"
      @close="closeDrawer"
    >
      <template #footer>
        <BaseButton class="m-b10px" type="primary">确定</BaseButton>
      </template>
    </LookTrainingDrawer>
    <ElDivider content-position="left">培训内容</ElDivider>

    <Table :columns="allSchemas.tableColumns" :data="dataList" />
  </div>
</template>

<script setup lang="tsx">
import LookTrainingDrawer from './LookTrainingDrawer.vue'
import { reactive, ref, watch } from 'vue'
import { ElDivider } from 'element-plus'
import { Table } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatTime, secondsToTime } from '@/utils'
import { cloneDeep } from 'lodash-es'
import { getTrainingCourse } from '@/api/training'
const lookTrainingDrawerRef = ref<ComponentRef<typeof LookTrainingDrawer>>()
const showDrawer = ref<boolean>(false)
const drawerData = ref<any>()

const dataList = ref<any[]>([])

const props = defineProps({
  echoData: {
    type: Object,
    default: () => {}
  }
})

const editContent = ref<any>()

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
    label: '标题',
    search: {
      hidden: false
    }
  },
  {
    field: 'duration',
    label: '时长',
    search: {
      hidden: false
    },
    slots: {
      default: ({ row }: any) => {
        return secondsToTime(row.duration)
      }
    }
  },
  {
    field: 'type',
    label: '类型',
    search: {
      hidden: false
    },
    slots: {
      default: ({ row }: any) => {
        const videoPattern = /<video.*?>.*?<\/video>/i
        return videoPattern.test(row.content) ? '视频' : '文本'
      }
    }
  },
  {
    field: 'all_count',
    label: '培训总人数',
    search: {
      hidden: true
    },
    slots: {
      default: ({ row }: any) => {
        return (row?.active_user_count || 0) + (row?.un_active_user_count || 0)
      }
    }
  },
  {
    field: 'active_user_count',
    label: '已参与人数',
    search: {
      hidden: true
    }
  },
  {
    field: 'un_active_user_count',
    label: '未参与人数',
    search: {
      hidden: true
    }
  },
  {
    field: 'created_at',
    label: '创建时间',
    search: {
      hidden: true
    },
    slots: {
      default: (data: any) => {
        const row = data.row
        return <>{formatTime(row.created_at, 'yyyy-MM-dd HH:mm:ss')}</>
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
      default: ({ row, $index }: any) => {
        return (
          <>
            <BaseButton link type="primary" onClick={() => look(row)}>
              查看详情
            </BaseButton>
          </>
        )
      }
    }
  }
])

const look = async (row: any) => {
  const result = await getTrainingCourse({ id: row.id })
  drawerData.value = result.data
  showDrawer.value = true
}

const closeDrawer = () => {
  editContent.value = {}
  showDrawer.value = false
}

watch(
  () => props.echoData?.id,
  () => {
    dataList.value = cloneDeep(props.echoData?.trainings_courses || [])
  },
  {
    immediate: true
  }
)

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
