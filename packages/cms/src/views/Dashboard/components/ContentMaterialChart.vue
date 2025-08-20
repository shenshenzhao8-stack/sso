<template>
  <ContentWrap>
    <Echart :options="options" :height="450" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, watch, type PropType } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Echart } from '@/components/Echart'
import { type DashboardStatisticsMaterialCountType } from '@/api/dashboard/types'

const props = defineProps({
  data: {
    type: Array as PropType<DashboardStatisticsMaterialCountType[]>,
    default: () => []
  }
})

watch(
  () => props.data,
  (newVal) => {
    setOptions(newVal)
  }
)

const options = ref({})

const setOptions = (chartData: DashboardStatisticsMaterialCountType[]) => {
  const materialCountData = chartData.map((item) => {
    return {
      value: item.count,
      name: item.name
    }
  })
  options.value = {
    grid: {
      left: 20,
      right: 20,
      top: 80,
      bottom: 40
    },
    legend: {
      type: 'scroll', // 开启滚动模式
      bottom: 0,
      textStyle: {
        color: '#63656E',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item'
    },
    title: {
      text: '各类内容资料数量占比'
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        label: {
          formatter: '{c}'
        },
        data: materialCountData
      }
    ]
  }
}
</script>
