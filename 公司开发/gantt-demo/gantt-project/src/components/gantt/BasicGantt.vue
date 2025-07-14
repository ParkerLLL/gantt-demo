<template>
  <div class="basic-gantt-wrapper">
    <!-- 加载状态 -->
    <div v-if="!isInitialized" class="gantt-loading">
      <a-spin size="large" tip="初始化甘特图...">
        <div class="loading-placeholder"></div>
      </a-spin>
    </div>
    
    <!-- 甘特图容器 -->
    <div 
      ref="ganttContainer" 
      class="basic-gantt"
      :class="{ 'gantt-hidden': !isInitialized }"
    ></div>
    
    <!-- 数据为空时的提示 -->
    <div v-if="isInitialized && filteredTasks.length === 0" class="gantt-empty">
      <a-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { gantt } from 'dhtmlx-gantt'
import { useGanttStore } from '@/stores/gantt'
import { storeToRefs } from 'pinia'

// 定义事件
interface Emits {
  (e: 'task-click', data: { id: string, type: string, workItemType?: string }): void
  (e: 'iteration-click', iterationId: string): void
  (e: 'person-click', personId: string): void
}

const emit = defineEmits<Emits>()

const ganttContainer = ref<HTMLElement>()
const ganttStore = useGanttStore()
const { config, ganttTasks, filteredTasks } = storeToRefs(ganttStore)
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
          { unit: 'quarter', step: 1, format: function(date) {
            const quarter = Math.floor(date.getMonth() / 3) + 1
            return 'Q' + quarter
          }}
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

// 监听时间刻度变化 - 添加防抖避免频繁切换
let scaleUpdateTimer: NodeJS.Timeout | null = null

watch(() => config.value.timeScale, (newScale) => {
  console.log('监听到时间刻度变化:', newScale)
  
  if (scaleUpdateTimer) {
    clearTimeout(scaleUpdateTimer)
  }
  
  scaleUpdateTimer = setTimeout(() => {
    if (ganttContainer.value && newScale && isInitialized.value) {
      setTimeScale(newScale)
    }
    scaleUpdateTimer = null
  }, 100) // 100ms防抖
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
          { name: 'end_date', label: '结束时间', align: 'center', width: 100 }
        ]
        gantt.config.grid_width = 400
        gantt.config.readonly = true
        
        // 自定义任务模板，为人员节点添加特殊样式类
        gantt.templates.task_class = function(start, end, task) {
          if (task.type === 'project' || task.workItemType === 'person') {
            return 'gantt_project_task'
          }
          return ''
        }
        
        // 初始时间刻度
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%Y年%m月' },
          { unit: 'day', step: 1, format: '%d日' }
        ]
        
        // 设置事件处理器
        setupEventHandlers()
        
        // 初始化
        gantt.init(ganttContainer.value)
        
        // 优先使用筛选后的store数据，如果没有则使用测试数据
        if (filteredTasks.value && filteredTasks.value.length > 0) {
          const data = {
            data: filteredTasks.value,
            links: []
          }
          gantt.parse(data)
          console.log('使用筛选后的store数据，任务数量:', filteredTasks.value.length)
        } else if (ganttTasks.value && ganttTasks.value.length > 0) {
          const data = {
            data: ganttTasks.value,
            links: []
          }
          gantt.parse(data)
          console.log('使用完整store数据，任务数量:', ganttTasks.value.length)
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

// 监听filteredTasks数据变化（筛选后的数据）
watch(filteredTasks, (newTasks) => {
  if (!newTasks) return
  
  // 创建当前数据的快照用于比较
  const currentSnapshot = JSON.stringify(newTasks.map(task => ({ 
    id: task.id, 
    text: task.text, 
    parent: task.parent 
  })))
  
  // 只有在数据真正变化时才更新
  if (currentSnapshot !== lastTasksSnapshot) {
    console.log('检测到筛选数据变化，新任务数量:', newTasks.length)
    lastTasksSnapshot = currentSnapshot
    
    if (newTasks.length > 0) {
      debouncedUpdate(newTasks)
    } else {
      // 筛选结果为空时，清空甘特图
      console.log('筛选结果为空，清空甘特图')
      if (isInitialized.value) {
        gantt.clearAll()
      }
    }
  }
}, { immediate: false })

// 设置事件处理器
const setupEventHandlers = () => {
  // 任务点击事件
  gantt.attachEvent('onTaskClick', (id: string, e: Event) => {
    console.log('任务点击:', id)
    
    const task = gantt.getTask(id)
    console.log('点击的任务:', task)
    
    if (task) {
      // 发射通用任务点击事件
      emit('task-click', {
        id: task.id,
        type: task.type || 'task',
        workItemType: task.workItemType
      })
      
      // 根据任务类型发射特定事件
      if (task.type === 'project') {
        // 人员节点点击
        emit('person-click', task.personId || task.id)
      } else if (task.workItemType === 'iteration') {
        // 版本迭代点击
        emit('iteration-click', task.id)
      } else if (task.workItemType === 'requirement') {
        // 需求点击 - 暂时也打开版本详情
        emit('iteration-click', task.id)
      } else if (task.workItemType === 'task') {
        // 任务点击 - 暂时也打开版本详情
        emit('iteration-click', task.id)
      }
    }
    
    return true // 允许默认行为
  })

  // 任务双击事件
  gantt.attachEvent('onTaskDblClick', (id: string, e: Event) => {
    console.log('任务双击:', id)
    return false // 阻止默认的编辑行为
  })

  // 右键点击事件（可以用于上下文菜单）
  gantt.attachEvent('onTaskRowClick', (id: string, row: any) => {
    console.log('任务行点击:', id, row)
    return true
  })

  console.log('甘特图事件处理器已设置')
}

onUnmounted(() => {
  // 清理所有定时器
  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = null
  }
  
  if (scaleUpdateTimer) {
    clearTimeout(scaleUpdateTimer)
    scaleUpdateTimer = null
  }
  
  // 销毁甘特图实例
  if (gantt && typeof gantt.destructor === 'function') {
    gantt.destructor()
  }
})
</script>

<style lang="scss" scoped>
.basic-gantt-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  
  @media (max-width: 768px) {
    height: 450px;
  }
  
  @media (max-width: 480px) {
    height: 400px;
    border-radius: 4px;
  }

  .gantt-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 10;
    
    .loading-placeholder {
      width: 200px;
      height: 100px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  }

  .basic-gantt {
    width: 100%;
    height: 100%;
    transition: opacity 0.3s ease;
    
    &.gantt-hidden {
      opacity: 0;
      pointer-events: none;
    }
  }
  
  .gantt-empty {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    z-index: 5;
  }
}

// 甘特图样式优化
:deep(.gantt_tree_content) {
  font-size: 13px;
  color: #262626;
}

:deep(.gantt_task_line) {
  border-radius: 4px;
}

:deep(.gantt_task_progress) {
  border-radius: 4px;
}

:deep(.gantt_grid_scale) {
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

:deep(.gantt_scale_line) {
  border-bottom: 1px solid #e8e8e8;
}

// 隐藏人员层级（project类型）的甘特图横条
:deep(.gantt_project_task) {
  display: none !important;
}

:deep(.gantt_task_line.gantt_project_task) {
  display: none !important;
}

:deep(.gantt_bar_task.gantt_project_task) {
  display: none !important;
}
</style>