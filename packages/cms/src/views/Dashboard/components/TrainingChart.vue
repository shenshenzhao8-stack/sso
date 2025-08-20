<template>
  <ContentWrap>
    <Echart :options="options" :height="450" />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { ref, watch, type PropType } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Echart } from '@/components/Echart'
import { type DashboardStatisticsTrainingsType } from '@/api/dashboard/types'

const props = defineProps({
  data: {
    type: Array as PropType<DashboardStatisticsTrainingsType[]>,
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

const setOptions = (chartData: DashboardStatisticsTrainingsType[]) => {
  const xData = chartData.map((item) => item.title)
  const activeData = chartData.map((item) => item.active_user_count)
  const unActiveData = chartData.map((item) => item.un_active_user_count)
  const totalData = chartData.map((item) => item.total_user_count)
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
      text: '安全培训参与度占比'
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
          color: '#1CA6FF',
          borderRadius: [4, 4, 0, 0]
        },
        data: activeData
      },
      {
        name: '未参与人数',
        type: 'bar',
        emphasis: {
          disabled: true
        },
        barMaxWidth: 30,
        itemStyle: {
          color: '#FDD98D',
          borderRadius: [4, 4, 0, 0]
        },
        data: unActiveData
      },
      {
        name: '总人数',
        type: 'line',
        emphasis: {
          disabled: true
        },
        itemStyle: {
          color: '#21FFFF',
          borderRadius: [4, 4, 0, 0]
        },
        data: totalData
      }
    ]
  }
}
</script>
