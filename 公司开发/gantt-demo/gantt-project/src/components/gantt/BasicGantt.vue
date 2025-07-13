<template>
  <div class="basic-gantt-wrapper">
    <div ref="ganttContainer" class="basic-gantt"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { useGanttStore } from '@/stores/gantt'
import { storeToRefs } from 'pinia'

const ganttContainer = ref<HTMLElement>()
const ganttStore = useGanttStore()
const { config, ganttTasks } = storeToRefs(ganttStore)
const isInitialized = ref(false)

// 简单的测试数据
const testData = {
  data: [
    {
      id: 1,
      text: '人员-张三',
      start_date: '2024-01-01',
      duration: 90,
      progress: 0,
      type: 'project'
    },
    {
      id: 2,
      text: 'Sprint 2024.1',
      start_date: '2024-01-01',
      duration: 30,
      progress: 0.6,
      parent: 1
    },
    {
      id: 3,
      text: 'Sprint 2024.2',
      start_date: '2024-02-01',
      duration: 29,
      progress: 0.3,
      parent: 1
    },
    {
      id: 4,
      text: '人员-李四',
      start_date: '2024-01-01',
      duration: 90,
      progress: 0,
      type: 'project'
    },
    {
      id: 5,
      text: 'Bug Fix 2024.1',
      start_date: '2024-01-15',
      duration: 31,
      progress: 1.0,
      parent: 4
    }
  ],
  links: []
}

// 设置时间刻度
const setTimeScale = (scale: string) => {
  console.log('切换时间刻度到:', scale)
  
  try {
    // 清除现有的刻度配置
    delete gantt.config.scale_unit
    delete gantt.config.date_scale
    delete gantt.config.subscales
    
    // 设置新的刻度配置
    switch (scale) {
      case 'year':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y年' },
          { unit: 'month', step: 1, format: '%m月' }
        ]
        break
      case 'quarter':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y年' },
          { unit: 'quarter', step: 1, format: 'Q%q' }
        ]
        break
      case 'month':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%Y年%m月' },
          { unit: 'day', step: 1, format: '%d日' }
        ]
        break
      case 'week':
        gantt.config.scales = [
          { unit: 'week', step: 1, format: '%Y年第%W周' },
          { unit: 'day', step: 1, format: '%d日' }
        ]
        break
      case 'day':
        gantt.config.scales = [
          { unit: 'day', step: 1, format: '%Y-%m-%d' }
        ]
        break
      default:
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%Y年%m月' },
          { unit: 'day', step: 1, format: '%d日' }
        ]
    }
    
    // 重新渲染甘特图
    gantt.render()
    console.log('时间刻度切换完成')
  } catch (error) {
    console.error('时间刻度切换失败:', error)
  }
}

// 监听时间刻度变化
watch(() => config.value.timeScale, (newScale) => {
  console.log('监听到时间刻度变化:', newScale)
  if (ganttContainer.value && newScale) {
    setTimeScale(newScale)
  }
})

onMounted(() => {
  nextTick(() => {
    if (ganttContainer.value) {
      try {
        console.log('初始化基础甘特图...')
        
        // 基础配置
        gantt.config.date_format = '%Y-%m-%d'
        gantt.config.columns = [
          { name: 'text', label: '任务名称', tree: true, width: 200 },
          { name: 'start_date', label: '开始时间', align: 'center', width: 100 },
          { name: 'duration', label: '工期', align: 'center', width: 80 }
        ]
        gantt.config.grid_width = 380
        gantt.config.readonly = true
        
        // 初始时间刻度
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%Y年%m月' },
          { unit: 'day', step: 1, format: '%d日' }
        ]
        
        // 初始化
        gantt.init(ganttContainer.value)
        
        // 优先使用store数据，如果没有则使用测试数据
        if (ganttTasks.value && ganttTasks.value.length > 0) {
          const data = {
            data: ganttTasks.value,
            links: []
          }
          gantt.parse(data)
          console.log('使用store数据，任务数量:', ganttTasks.value.length)
        } else {
          gantt.parse(testData)
          console.log('使用默认测试数据')
        }
        
        console.log('基础甘特图初始化完成')
        isInitialized.value = true
      } catch (error) {
        console.error('基础甘特图初始化失败:', error)
      }
    }
  })
})

// 安全的数据监听机制 - 使用防抖和精确的变化检测
let updateTimer: NodeJS.Timeout | null = null
let lastTasksSnapshot = ''

const updateGanttData = (tasks: any[]) => {
  if (!isInitialized.value || !ganttContainer.value) return
  
  try {
    console.log('更新甘特图数据，任务数量:', tasks.length)
    const data = {
      data: tasks,
      links: []
    }
    gantt.clearAll()
    gantt.parse(data)
    console.log('甘特图数据更新完成')
  } catch (error) {
    console.error('甘特图数据更新失败:', error)
  }
}

// 防抖的数据更新函数
const debouncedUpdate = (tasks: any[]) => {
  if (updateTimer) {
    clearTimeout(updateTimer)
  }
  
  updateTimer = setTimeout(() => {
    updateGanttData(tasks)
    updateTimer = null
  }, 300) // 300ms防抖
}

// 监听ganttTasks数据变化
watch(ganttTasks, (newTasks) => {
  if (!newTasks) return
  
  // 创建当前数据的快照用于比较
  const currentSnapshot = JSON.stringify(newTasks.map(task => ({ 
    id: task.id, 
    text: task.text, 
    parent: task.parent 
  })))
  
  // 只有在数据真正变化时才更新
  if (currentSnapshot !== lastTasksSnapshot) {
    console.log('检测到ganttTasks数据变化')
    lastTasksSnapshot = currentSnapshot
    
    if (newTasks.length > 0) {
      debouncedUpdate(newTasks)
    }
  }
}, { immediate: false })

onUnmounted(() => {
  // 清理定时器
  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = null
  }
  
  // 销毁甘特图实例
  if (gantt && typeof gantt.destructor === 'function') {
    gantt.destructor()
  }
})
</script>

<style lang="scss" scoped>
.basic-gantt-wrapper {
  width: 100%;
  height: 500px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;

  .basic-gantt {
    width: 100%;
    height: 100%;
  }
}
</style>