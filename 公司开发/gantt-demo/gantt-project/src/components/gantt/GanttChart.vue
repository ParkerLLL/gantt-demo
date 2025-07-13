<template>
  <div class="gantt-chart-wrapper">
    <a-spin :spinning="loading" tip="加载中...">
      <div 
        ref="ganttContainer" 
        class="gantt-chart"
        :style="{ height: containerHeight + 'px' }"
      ></div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { useGanttStore } from '@/stores/gantt'
import { storeToRefs } from 'pinia'
import type { GanttTask } from '@/types'

const ganttStore = useGanttStore()
const { ganttTasks, loading, config } = storeToRefs(ganttStore)

const ganttContainer = ref<HTMLElement>()
const containerHeight = ref(600)

// 甘特图初始化配置
const initGanttConfig = () => {
  try {
    console.log('开始配置甘特图...')
    
    // 基础配置
    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.duration_unit = 'day'
    
    // 样式配置
    gantt.config.grid_width = 440
    gantt.config.row_height = 40
    
    // 只读配置
    gantt.config.readonly = true
    gantt.config.drag_move = false
    gantt.config.drag_resize = false
    gantt.config.drag_progress = false
    
    // 列配置
    gantt.config.columns = [
      {
        name: 'text',
        label: '任务名称',
        width: 200,
        tree: true
      },
      {
        name: 'start_date',
        label: '开始时间',
        width: 100,
        align: 'center'
      },
      {
        name: 'duration',
        label: '工期',
        width: 60,
        align: 'center'
      }
    ]
    
    console.log('甘特图配置完成')
  } catch (error) {
    console.error('甘特图配置失败:', error)
  }
}

// 设置时间刻度
const setTimeScale = (scale: string) => {
  console.log('设置时间刻度:', scale)
  // 暂时简化，后续完善
}

// 事件处理函数
const handleIterationClick = (task: GanttTask) => {
  console.log('点击版本迭代:', task)
  // 这里可以触发详情弹窗
}

const handlePersonClick = (task: GanttTask) => {
  console.log('点击人员:', task)
  // 这里可以触发人员角色弹窗
}

// 计算容器高度
const calculateHeight = () => {
  const windowHeight = window.innerHeight
  const headerHeight = 120 // 头部高度
  const padding = 48 // 内边距
  containerHeight.value = windowHeight - headerHeight - padding
}

// 监听窗口大小变化
const handleResize = () => {
  calculateHeight()
  nextTick(() => {
    if (typeof gantt.isTaskExists === 'function') {
      gantt.setSizes()
    }
  })
}

// 监听数据变化
watch(ganttTasks, (newTasks) => {
  console.log('甘特图组件收到新数据:', newTasks)
  if (newTasks && newTasks.length > 0 && ganttContainer.value) {
    try {
      // 转换数据格式
      const data = {
        data: newTasks,
        links: []
      }
      console.log('准备渲染甘特图数据:', data)
      
      // 安全地清理和解析数据
      if (typeof gantt.clearAll === 'function') {
        gantt.clearAll()
      }
      
      if (typeof gantt.parse === 'function') {
        gantt.parse(data)
        console.log('甘特图数据已解析')
      }
    } catch (error) {
      console.error('甘特图渲染错误:', error)
    }
  }
}, { deep: true })

// 监听时间刻度变化
watch(() => config.value.timeScale, (newScale) => {
  setTimeScale(newScale)
})

onMounted(() => {
  nextTick(() => {
    if (ganttContainer.value) {
      try {
        console.log('开始初始化甘特图...')
        
        // 先配置再初始化
        initGanttConfig()
        
        // 初始化甘特图
        gantt.init(ganttContainer.value)
        console.log('甘特图初始化完成')
        
        // 计算初始高度
        calculateHeight()
        
        // 监听窗口大小变化
        window.addEventListener('resize', handleResize)
        
        console.log('甘特图组件挂载完成')
      } catch (error) {
        console.error('甘特图初始化失败:', error)
      }
    }
  })
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
  
  // 销毁甘特图实例
  if (gantt && typeof gantt.destructor === 'function') {
    gantt.destructor()
  }
})
</script>

<style lang="scss">
// 甘特图样式
.gantt-chart-wrapper {
  height: 100%;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .gantt-chart {
    width: 100%;
  }
}

// 甘特图任务样式
.gantt-task-iteration {
  background: $gantt-task-bg;
  border: 1px solid darken($gantt-task-bg, 10%);
}

.gantt-task-requirement {
  background: #722ed1;
  border: 1px solid darken(#722ed1, 10%);
}

.gantt-task-task {
  background: #fa8c16;
  border: 1px solid darken(#fa8c16, 10%);
}

// 状态样式
.status-completed, .status-done {
  background: $gantt-task-completed !important;
  border-color: darken($gantt-task-completed, 10%) !important;
}

.status-cancelled, .status-rejected {
  background: $gantt-task-overdue !important;
  border-color: darken($gantt-task-overdue, 10%) !important;
}

.status-planning, .status-pending, .status-todo {
  background: #d9d9d9 !important;
  border-color: darken(#d9d9d9, 10%) !important;
}

// 人员行样式
.gantt-person-row {
  background-color: $gantt-header-bg;
  font-weight: 600;
}

// 进度单元格样式
.progress-cell {
  padding: 4px 8px;
  background: #f0f2f5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

// 重写甘特图默认样式
.gantt_grid_scale .gantt_grid_head_cell,
.gantt_task_scale .gantt_scale_cell {
  background: $gantt-header-bg;
  border-color: $gantt-grid-border;
  font-weight: 500;
}

.gantt_grid_data .gantt_cell,
.gantt_task_cell {
  border-color: $gantt-grid-border;
}

.gantt_grid_data .gantt_row:hover {
  background: #f5f5f5;
}

.gantt_task_row:hover {
  background: rgba(24, 144, 255, 0.04);
}
</style>