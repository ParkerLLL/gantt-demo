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

// 中国法定节假日配置 (2024年)
const holidays = [
  '2024-01-01', // 元旦
  '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15', '2024-02-16', '2024-02-17', // 春节
  '2024-04-04', '2024-04-05', '2024-04-06', // 清明节  
  '2024-05-01', '2024-05-02', '2024-05-03', // 劳动节
  '2024-06-10', // 端午节
  '2024-09-15', '2024-09-16', '2024-09-17', // 中秋节
  '2024-10-01', '2024-10-02', '2024-10-03', '2024-10-04', '2024-10-05', '2024-10-06', '2024-10-07', // 国庆节
]

// 详情按钮点击处理函数
const handleContainerClick = (e: Event) => {
  const target = e.target as HTMLElement
  
  // 检查是否点击了详情按钮
  if (target.classList.contains('gantt-detail-btn') || target.closest('.gantt-detail-btn')) {
    e.stopPropagation() // 阻止事件冒泡到甘特图的默认点击处理
    
    const button = target.classList.contains('gantt-detail-btn') 
      ? target 
      : target.closest('.gantt-detail-btn') as HTMLElement
    
    const taskId = button.getAttribute('data-id')
    const personId = button.getAttribute('data-person-id')
    const taskType = button.getAttribute('data-type')
    
    console.log('详情按钮点击:', { taskId, personId, taskType })
    
    if (button.classList.contains('gantt-person-btn')) {
      // 人员详情按钮
      if (personId) emit('person-click', personId)
    } else if (button.classList.contains('gantt-iteration-btn')) {
      // 版本迭代详情按钮
      if (taskId) emit('iteration-click', taskId)
    } else if (button.classList.contains('gantt-task-btn')) {
      // 其他任务详情按钮
      if (taskId) {
        emit('task-click', {
          id: taskId,
          type: 'task',
          workItemType: taskType || undefined
        })
      }
    }
  }
}

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

// 配置时间轴样式 (节假日和周末)
const setupTimeAxisStyles = () => {
  // 自定义时间轴单元格样式
  // @ts-ignore
  gantt.templates.scale_cell_class = function(date: Date) {
    const dayOfWeek = date.getDay()
    // @ts-ignore
    const dateStr = gantt.date.date_to_str('%Y-%m-%d')(date)
    
    // 节假日优先级最高
    if (holidays.includes(dateStr)) {
      return 'holiday-cell'
    }
    
    // 周末 (周六=6, 周日=0) 
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend-cell'
    }
    
    return ''
  }
  
  // 自定义任务区域背景样式 (对应时间轴)
  // @ts-ignore
  gantt.templates.timeline_cell_class = function(task: any, date: Date) {
    const dayOfWeek = date.getDay()
    // @ts-ignore
    const dateStr = gantt.date.date_to_str('%Y-%m-%d')(date)
    
    // 节假日优先级最高
    if (holidays.includes(dateStr)) {
      return 'holiday-timeline-cell'
    }
    
    // 周末
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend-timeline-cell'
    }
    
    return ''
  }
}

// 设置时间刻度
const setTimeScale = (scale: string) => {
  console.log('切换时间刻度到:', scale)
  
  try {
    // 清除现有的刻度配置
    // @ts-ignore
    delete gantt.config.scale_unit
    // @ts-ignore
    delete gantt.config.date_scale
    // @ts-ignore
    delete gantt.config.subscales
    
    // 重置scale_height和min_column_width到默认值
    gantt.config.scale_height = 45
    // @ts-ignore
    gantt.config.min_column_width = 50
    
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
          { unit: 'quarter', step: 1, format: function(date: Date) {
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
          { unit: 'month', step: 1, format: '%Y年%m月' },
          { unit: 'day', step: 1, format: '%j' }
        ]
        // 日期刻度特殊配置
        gantt.config.scale_height = 60
        // @ts-ignore
        gantt.config.min_column_width = 35
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
          { name: 'text', label: '任务名称', tree: true, width: 180 },
          { name: 'start_date', label: '开始时间', align: 'center', width: 90 },
          { name: 'end_date', label: '结束时间', align: 'center', width: 90 },
          { 
            name: 'action', 
            label: '操作', 
            align: 'center', 
            width: 80,
            template: function(task: any) {
              if (task.type === 'project') {
                // 人员节点显示人员详情按钮
                return `<button class="gantt-detail-btn gantt-person-btn" data-id="${task.id}" data-person-id="${task.personId || task.id}">
                  <span class="btn-icon">👤</span>
                  <span class="btn-text">详情</span>
                </button>`
              } else if (task.workItemType === 'iteration') {
                // 版本迭代显示版本详情按钮
                return `<button class="gantt-detail-btn gantt-iteration-btn" data-id="${task.id}">
                  <span class="btn-icon">📋</span>
                  <span class="btn-text">详情</span>
                </button>`
              } else {
                // 其他工作项显示通用详情按钮
                return `<button class="gantt-detail-btn gantt-task-btn" data-id="${task.id}" data-type="${task.workItemType}">
                  <span class="btn-icon">📄</span>
                  <span class="btn-text">详情</span>
                </button>`
              }
            }
          }
        ]
        gantt.config.grid_width = 440
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
        
        // 设置时间轴样式
        setupTimeAxisStyles()
        
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
  // 添加容器点击监听器
  if (ganttContainer.value) {
    ganttContainer.value.addEventListener('click', handleContainerClick)
  }

  // 保留任务行点击事件用于展开/收起（但不触发详情弹窗）
  gantt.attachEvent('onTaskRowClick', (id: string, row: any) => {
    console.log('任务行点击（展开/收起）:', id)
    return true // 允许默认的展开/收起行为
  })

  // 任务双击事件
  gantt.attachEvent('onTaskDblClick', (id: string, e: Event) => {
    console.log('任务双击:', id)
    return false // 阻止默认的编辑行为
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
  
  // 清理事件监听器
  if (ganttContainer.value) {
    ganttContainer.value.removeEventListener('click', handleContainerClick)
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

// 详情按钮样式
:deep(.gantt-detail-btn) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 4px;
  font-size: 11px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  
  &:hover {
    background: #e6f7ff;
    border-color: #91d5ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(24, 144, 255, 0.3);
  }
  
  .btn-icon {
    font-size: 10px;
    line-height: 1;
  }
  
  .btn-text {
    font-weight: 500;
    white-space: nowrap;
  }
}

// 时间轴节假日和周末样式
:deep(.weekend-cell) {
  background-color: #f8f9fa !important;
  color: #6c757d !important;
  border-left: 1px solid #dee2e6 !important;
}

:deep(.holiday-cell) {
  background-color: #fff3cd !important;
  color: #856404 !important;
  border-left: 1px solid #ffeaa7 !important;
  font-weight: 500;
}

:deep(.special-date) {
  color: inherit;
  font-weight: 500;
}

// 日期刻度优化
:deep(.gantt_scale_line) {
  font-size: 12px;
  text-align: center;
}

// 时间线区域节假日和周末样式
:deep(.weekend-timeline-cell) {
  background-color: #f8f9fa !important;
}

:deep(.holiday-timeline-cell) {
  background-color: #fff3cd !important;
}

// 不同类型按钮的颜色变化
:deep(.gantt-person-btn) {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
  
  &:hover {
    background: #f0fff0;
    border-color: #95de64;
  }
}

:deep(.gantt-iteration-btn) {
  background: #f9f0ff;
  border-color: #d3adf7;
  color: #722ed1;
  
  &:hover {
    background: #f0e6ff;
    border-color: #b37feb;
  }
}

:deep(.gantt-task-btn) {
  background: #fff7e6;
  border-color: #ffd591;
  color: #fa8c16;
  
  &:hover {
    background: #fff2e6;
    border-color: #ffb366;
  }
}
</style>