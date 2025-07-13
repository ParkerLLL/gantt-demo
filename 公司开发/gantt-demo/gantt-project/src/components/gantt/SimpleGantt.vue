<template>
  <div class="simple-gantt-wrapper">
    <div ref="ganttContainer" class="simple-gantt"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { useGanttStore } from '@/stores/gantt'
import { storeToRefs } from 'pinia'

const ganttContainer = ref<HTMLElement>()
const ganttStore = useGanttStore()
const { ganttTasks } = storeToRefs(ganttStore)
const isInitialized = ref(false)

// 简单的测试数据（备用）
const defaultTestData = {
  data: [
    {
      id: 1,
      text: '项目开始',
      start_date: '2024-01-01',
      duration: 30,
      progress: 0.6,
      type: 'project'
    },
    {
      id: 2,
      text: '任务1',
      start_date: '2024-01-01',
      duration: 10,
      progress: 0.8,
      parent: 1
    },
    {
      id: 3,
      text: '任务2',
      start_date: '2024-01-15',
      duration: 15,
      progress: 0.3,
      parent: 1
    }
  ],
  links: []
}

// 更新甘特图数据
const updateGanttData = (tasks: any[]) => {
  nextTick(() => {
    if (ganttContainer.value && tasks.length > 0) {
      try {
        console.log('更新甘特图数据:', tasks)
        const data = {
          data: tasks,
          links: []
        }
        gantt.clearAll()
        gantt.parse(data)
        console.log('甘特图数据更新完成')
      } catch (error) {
        console.error('更新甘特图数据失败:', error)
      }
    }
  })
}

// 监听store中的数据变化
watch(ganttTasks, (newTasks) => {
  if (!isInitialized.value) return
  
  console.log('SimpleGantt收到新数据:', newTasks)
  if (newTasks && newTasks.length > 0) {
    updateGanttData(newTasks)
  }
}, { deep: true, flush: 'post' })

onMounted(() => {
  nextTick(() => {
    if (ganttContainer.value) {
      try {
        console.log('初始化简单甘特图...')
        
        // 基础配置
        gantt.config.date_format = '%Y-%m-%d'
        gantt.config.columns = [
          { name: 'text', label: '任务', tree: true, width: 200 },
          { name: 'duration', label: '工期', align: 'center', width: 80 }
        ]
        
        // 初始化
        gantt.init(ganttContainer.value)
        
        // 加载默认数据
        gantt.parse(defaultTestData)
        
        console.log('简单甘特图初始化完成')
        isInitialized.value = true
        
        // 初始化完成后，如果有store数据就更新
        if (ganttTasks.value && ganttTasks.value.length > 0) {
          setTimeout(() => {
            updateGanttData(ganttTasks.value)
          }, 100)
        }
      } catch (error) {
        console.error('简单甘特图初始化失败:', error)
      }
    }
  })
})

onUnmounted(() => {
  if (gantt && typeof gantt.destructor === 'function') {
    gantt.destructor()
  }
})
</script>

<style lang="scss" scoped>
.simple-gantt-wrapper {
  width: 100%;
  height: 400px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;

  .simple-gantt {
    width: 100%;
    height: 100%;
  }
}
</style>