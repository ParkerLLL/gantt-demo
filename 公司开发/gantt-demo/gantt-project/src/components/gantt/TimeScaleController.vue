<template>
  <div class="time-scale-controller">
    <a-radio-group 
      v-model:value="currentScale" 
      button-style="solid" 
      size="small"
      @change="handleScaleChange"
    >
      <a-radio-button value="year">年</a-radio-button>
      <a-radio-button value="quarter">季度</a-radio-button>
      <a-radio-button value="month">月</a-radio-button>
      <a-radio-button value="week">周</a-radio-button>
      <a-radio-button value="day">日</a-radio-button>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGanttStore } from '@/stores/gantt'
import { storeToRefs } from 'pinia'
import type { TimeScale } from '@/types'

const ganttStore = useGanttStore()
const { config } = storeToRefs(ganttStore)

const currentScale = ref<TimeScale>('month')

// 处理时间刻度变化
const handleScaleChange = (e: any) => {
  const newScale = e.target.value as TimeScale
  ganttStore.setTimeScale(newScale)
}

// 监听store中的时间刻度变化
watch(() => config.value.timeScale, (newScale) => {
  currentScale.value = newScale
}, { immediate: true })
</script>

<style lang="scss" scoped>
.time-scale-controller {
  :deep(.ant-radio-group) {
    .ant-radio-button-wrapper {
      padding: 0 12px;
      height: 28px;
      line-height: 26px;
      font-size: 12px;
      
      &.ant-radio-button-wrapper-checked {
        background: #1890ff;
        border-color: #1890ff;
        color: white;
      }
    }
  }
}
</style>