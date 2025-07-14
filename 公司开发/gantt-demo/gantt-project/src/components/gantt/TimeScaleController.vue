<template>
  <div class="time-scale-controller">
    <div class="scale-label">时间刻度:</div>
    <a-radio-group 
      v-model:value="currentScale" 
      button-style="solid" 
      size="small"
      @change="handleScaleChange"
    >
      <a-radio-button value="year">
        <CalendarOutlined />
        年
      </a-radio-button>
      <a-radio-button value="quarter">
        <BlockOutlined />
        季度
      </a-radio-button>
      <a-radio-button value="month">
        <CalendarOutlined />
        月
      </a-radio-button>
      <a-radio-button value="week">
        <ScheduleOutlined />
        周
      </a-radio-button>
      <a-radio-button value="day">
        <CalendarTwoTone />
        日
      </a-radio-button>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CalendarOutlined, BlockOutlined, ScheduleOutlined, CalendarTwoTone } from '@ant-design/icons-vue'
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
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .scale-label {
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    font-weight: 500;
  }
  
  :deep(.ant-radio-group) {
    display: flex;
    flex-direction: row;
    
    .ant-radio-button-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 8px;
      height: 26px;
      line-height: 24px;
      font-size: 12px;
      min-width: 50px;
      transition: all 0.2s ease;
      border-radius: 4px;
      
      &:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }
      
      &:last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
      
      &.ant-radio-button-wrapper-checked {
        background: #1890ff;
        border-color: #1890ff;
        color: white;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
      }
      
      &:hover:not(.ant-radio-button-wrapper-checked) {
        background: #f0f9ff;
        border-color: #91d5ff;
        transform: translateY(-1px);
      }
      
      .anticon {
        font-size: 11px;
        margin-right: 2px;
      }
    }
  }
}
</style>