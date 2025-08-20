<template>
  <div class="exam-situation">
    <AddTrainingContentDrawer
      ref="addTrainingContentDrawerRef"
      v-model:model-value="showDrawer"
      :name="activeRow?.name"
      :editContent="editContent"
      @close="closeDrawer"
    >
      <template #footer>
        <BaseButton type="primary" @click="addContent">确定</BaseButton>
        <BaseButton @click="() => (showDrawer = false)">取消</BaseButton>
      </template>
    </AddTrainingContentDrawer>
    <ElDivider content-position="left">配置内容</ElDivider>
    <BaseButton class="m-b10px" type="primary" :disabled="disabled" @click="add">
      添加培训课程
    </BaseButton>
    <Table :columns="allSchemas.tableColumns" :data="dataList" />
  </div>
</template>

<script setup lang="tsx">
import AddTrainingContentDrawer from './AddTrainingContentDrawer.vue'
import { reactive, ref, watch } from 'vue'
import { ElDivider, ElMessage, ElMessageBox } from 'element-plus'
import { Table } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { type CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { formatTime, getDayTimeNumber, secondsToTime } from '@/utils'
import dayjs from 'dayjs'
import { useEventBus } from '@/hooks/event/useEventBus'
import { update, cloneDeep } from 'lodash-es'
const addTrainingContentDrawerRef = ref<ComponentRef<typeof AddTrainingContentDrawer>>()
const activeRow = ref<any>()
const showDrawer = ref<boolean>(false)

const dataList = ref<any[]>([])

const props = defineProps({
  echoData: {
    type: Object,
    default: () => {}
  },
  disabled: {
    type: Boolean,
    default: false
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
            <BaseButton disabled={props.disabled} link type="primary" onClick={() => action(row)}>
              编辑
            </BaseButton>

            <BaseButton
              link
              disabled={props.disabled}
              type="danger"
              onClick={() => {
                console.log(row)
                ElMessageBox.confirm('确定删除该条记录吗？', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  dataList.value.splice($index, 1)
                  useEventBus().emit('delTrainingContent', $index)
                })
              }}
            >
              删除
            </BaseButton>

            <BaseButton
              link
              type="default"
              disabled={$index === 0 || props.disabled}
              onClick={() => handleMove($index, 'up')}
            >
              上移
            </BaseButton>

            <BaseButton
              link
              type="default"
              disabled={$index === dataList.value.length - 1 || props.disabled}
              onClick={() => handleMove($index, 'down')}
            >
              下移
            </BaseButton>
          </>
        )
      }
    }
  }
])

const action = (row: any) => {
  editContent.value = {
    ...row,
    duration: dayjs().startOf('day').unix() * 1000 + (row.duration || 0) * 1000
  }
  showDrawer.value = true
}

const closeDrawer = () => {
  editContent.value = {}
  showDrawer.value = false
}

const add = () => {
  editContent.value = {}
  showDrawer.value = true
}

const addContent = async () => {
  const result = await addTrainingContentDrawerRef.value?.submit()
  if (!result) return

  const data: Record<any, any> = {
    ...result,
    duration: getDayTimeNumber(result.duration)
  }

  if (data.id) {
    const result = Object.assign(
      dataList.value[dataList.value.findIndex((item: any) => item.id === data.id)],
      data
    )
    useEventBus().emit('updateTrainingContent', {
      id: result.id,
      duration: result.duration,
      title: result.title,
      content: result.content,
      updated_at: new Date()
    })
  } else {
    const flg = dataList.value.find((item) => item.title == result.title)

    if (flg) {
      ElMessage.error('标题重复')
      return
    }
    const e = {
      id: '_' + new Date().getTime(),
      created_at: new Date(),
      updated_at: new Date(),
      ...data
    }
    dataList.value.push(e)
    useEventBus().emit('addTrainingContent', e)
  }
  showDrawer.value = false
}

// 添加移动方法
const handleMove = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= dataList.value.length) return

  // 交换位置
  const temp = dataList.value[index]
  dataList.value[index] = dataList.value[newIndex]
  dataList.value[newIndex] = temp
  useEventBus().emit(
    'trainingContentOrderChange',
    dataList.value.map((item: any) => item.id)
  )
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
