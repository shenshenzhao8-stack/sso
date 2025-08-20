<template>
  <ContentWrap>
    <Echart :options="options" :height="450" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, watch, type PropType } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Echart } from '@/components/Echart'
import { type DashboardStatisticsExamsType } from '@/api/dashboard/types'

const props = defineProps({
  data: {
    type: Array as PropType<DashboardStatisticsExamsType[]>,
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

const setOptions = (chartData: DashboardStatisticsExamsType[]) => {
  const xData = chartData.map((item) => item.title)
  const activeData = chartData.map((item) => item.active_user_count)
  const passedData = chartData.map((item) => item.passed_count)
  const unPassedData = chartData.map((item) => item.un_passed_count)
  options.value = {
    grid: {
      left: 20,
      right: 20,
      top: 80,
      bottom: 40,
      containLabel: true
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: '#63656E',
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: 'rgba(255,255,255,0.9)',
      extraCssText: 'box-shadow: 3px 4px 14px 0px rgba(77,231,170,0.32)'
    },
    title: {
      text: '考试通过率占比'
    },
    xAxis: {
      type: 'category',
      offset: 0,
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: '#EAEBED'
        }
      },
      axisLabel: {
        interval: 'auto',
        fontSize: 14,
        color: '#63656E'
      },
      data: xData
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 14,
        color: '#B0B2B8'
      }
    },
    series: [
      {
        name: '参与人数',
        type: 'bar',
        emphasis: {
          disabled: true
        },
        barMaxWidth: 30,
        itemStyle: {
          color: '#1C9AFE',
          borderRadius: [4, 4, 0, 0]
        },
        data: activeData
      },
      {
        name: '通过人数',
        type: 'line',
        emphasis: {
          disabled: true
        },
        itemStyle: {
          color: '#21FFFF',
          borderRadius: [4, 4, 0, 0]
        },
        data: passedData
      },
      {
        name: '未通过人数',
        type: 'line',
        emphasis: {
          disabled: true
        },
        itemStyle: {
          color: '#FC758A',
          borderRadius: [4, 4, 0, 0]
        },
        data: unPassedData
      }
    ]
  }
}
</script>
