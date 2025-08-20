<template>
  <ContentWrap>
    <Search :schema="schema" @search="searchAction" @reset="resetAction" @register="formRegister" />
  </ContentWrap>
  <div class="flex justify-between mt-20px">
    <div class="total-stats bg-#F65779 relative">
      <Icon
        class="!absolute right-10"
        :style="{ color: 'rgba(255,255,255,0.3)' }"
        icon="material-symbols:health-and-safety"
        :size="80"
      />
      <div>信息安全培训总计</div>
      <div class="font-600 text-size-38px">{{ statistics?.training_count ?? 0 }}</div>
    </div>
    <div class="total-stats bg-#26A0E5 ml-30px relative">
      <Icon
        class="!absolute right-10"
        :style="{ color: 'rgba(255,255,255,0.3)' }"
        icon="material-symbols:edit-document-outline"
        :size="80"
      />
      <div>信息安全考试总计</div>
      <div class="font-600 text-size-38px">{{ statistics?.exam_count ?? 0 }}</div>
    </div>
    <div class="total-stats bg-#ABABAB ml-30px relative">
      <Icon
        class="!absolute right-10"
        :style="{ color: 'rgba(255,255,255,0.3)' }"
        icon="material-symbols:database-outline"
        :size="80"
      />
      <div>资料库内容总计</div>
      <div class="font-600 text-size-38px">{{ statistics?.material_count ?? 0 }}</div>
    </div>
  </div>
  <ExamChart class="mt-20px" :data="statistics?.exams ?? []" />
  <TrainingChart class="mt-20px" :data="statistics?.trainings ?? []" />
  <div class="mt-20px flex">
    <BusinessMaterialChart class="flex-1" :data="statistics?.material_by_business_tag ?? []" />
    <ContentMaterialChart
      class="ml-20px flex-1"
      :data="statistics?.material_by_content_tag ?? []"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Search } from '@/components/Search'
import { type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { ContentWrap } from '@/components/ContentWrap'
import ExamChart from '@/views/Dashboard/components/ExamChart.vue'
import TrainingChart from '@/views/Dashboard/components/TrainingChart.vue'
import BusinessMaterialChart from '@/views/Dashboard/components/BusinessMaterialChart.vue'
import ContentMaterialChart from '@/views/Dashboard/components/ContentMaterialChart.vue'
import { getDictEags } from '@/api/tag/index'
import { getDashboardStatisticsApi } from '@/api/dashboard/index'
import { type DashboardStatisticsType } from '@/api/dashboard/types'
import { Icon } from '@/components/Icon/index'

const { formRegister, formMethods } = useForm()
const { setSchema, setValues } = formMethods

const schema = reactive<FormSchema[]>([
  {
    field: 'business_tags',
    component: 'Select',
    componentProps: {
      multiple: true,
      placeholder: '请选择业务标签',
      style: {
        width: '200px'
      },
      on: {
        change: (val: any) => {
          selectedBusinessTagsChange(val)
        }
      }
    }
  },
  {
    field: 'content_tags',
    component: 'Select',
    componentProps: {
      multiple: true,
      placeholder: '请选择内容标签',
      style: {
        width: '200px'
      },
      on: {
        change: (val: any) => {
          selectedContentTagsChange(val)
        }
      }
    }
  },
  {
    field: 'date_range',
    component: 'DatePicker',
    componentProps: {
      type: 'daterange',
      style: {
        width: '250px'
      }
    }
  }
])

const businessTags = ref<any[]>([])
const contentTags = ref<any[]>([])
const searchParams = ref<any>({})
const statistics = ref<DashboardStatisticsType>()

onMounted(() => {
  getTags()
  getStatistics()
})

const selectedBusinessTagsChange = (val: number[]) => {
  if (val.length === 0) return
  if (val[val.length - 1] === 0) {
    setValues({
      business_tags: [0]
    })
  } else {
    setValues({
      business_tags: val.filter((item: number) => item !== 0)
    })
  }
}

const selectedContentTagsChange = (val: number[]) => {
  if (val.length === 0) return
  if (val[val.length - 1] === 0) {
    setValues({
      content_tags: [0]
    })
  } else {
    setValues({
      content_tags: val.filter((item: number) => item !== 0)
    })
  }
}

const searchAction = (params: any) => {
  let nextDay
  if (params.date_range?.[1]) {
    nextDay = new Date(params.date_range?.[1])
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0)
  }

  const business_tags =
    params.business_tags?.length && !params.business_tags.includes(0)
      ? params.business_tags
      : undefined
  const content_tags =
    params.content_tags?.length && !params.content_tags.includes(0)
      ? params.content_tags
      : undefined
  searchParams.value = {
    business_tags,
    content_tags,
    start_at: params.date_range?.[0]?.toISOString(),
    end_at: nextDay?.toISOString()
  }
  getStatistics()
}

const resetAction = () => {
  searchParams.value = {}
  getStatistics()
}

const getTags = async () => {
  const res = await getDictEags({ category: '1,2,3' })
  if (res.code === 200) {
    businessTags.value = [
      {
        label: '全部业务',
        value: 0
      },
      ...(res.data?.business_tags ?? []).map((item: any) => {
        return {
          label: item.name,
          value: item.id
        }
      })
    ]
    contentTags.value = [
      {
        label: '全部内容',
        value: 0
      },
      ...(res.data?.content_tags ?? []).map((item: any) => {
        return {
          label: item.name,
          value: item.id
        }
      })
    ]

    setSchema([
      {
        field: 'business_tags',
        path: 'componentProps.options',
        value: businessTags.value
      }
    ])
    setValues({
      business_tags: [0]
    })

    setSchema([
      {
        field: 'content_tags',
        path: 'componentProps.options',
        value: contentTags.value
      }
    ])
    setValues({
      content_tags: [0]
    })
  }
}

const getStatistics = async () => {
  const res = await getDashboardStatisticsApi({
    ...searchParams.value
  })
  if (res.code === 200) {
    statistics.value = res.data
  }
}
</script>

<style lang="less" scoped>
:deep(.el-form-item) {
  margin-bottom: 0;
}

.total-stats {
  padding: 20px;
  color: #fff;
  border-radius: 10px;
  flex: 1;
}
</style>
