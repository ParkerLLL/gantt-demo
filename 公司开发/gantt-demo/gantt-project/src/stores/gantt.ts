import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  GanttTask, 
  ViewType, 
  TimeScale, 
  FilterConfig, 
  Iteration, 
  Requirement,
  GanttConfig
} from '@/types'

// 帮助函数 - 计算天数
function calculateDuration(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 帮助函数 - 计算进度
function calculateProgress(item: { totalWorkItems?: number, completedWorkItems?: number }): number {
  if (item.totalWorkItems && item.totalWorkItems > 0) {
    return (item.completedWorkItems || 0) / item.totalWorkItems
  }
  return 0
}

// 帮助函数 - 获取状态颜色
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'planning': '#5DADE2',
    'active': '#58D68D',
    'completed': '#AAB7B8',
    'cancelled': '#EC7063',
    'pending': '#F4D03F',
    'in_progress': '#5DADE2',
    'testing': '#AF7AC5',
    'rejected': '#EC7063',
  }
  return colorMap[status] || '#AAB7B8'
}

export const useGanttStore = defineStore('gantt', () => {
  // 状态
  const config = ref<GanttConfig>({
    viewType: 'iteration',
    timeScale: 'month',
    filters: {},
    showWeekends: false,
    showCriticalPath: false,
    expandAll: false,
    pagination: {
      current: 1,
      pageSize: 50,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true
    },
    lazyLoad: {
      expandedNodes: new Set<string>(),
      loadedPersons: new Set<string>(),
      maxItemsPerPerson: 10
    }
  })

  const rawData = ref<{
    iterations: Iteration[]
    requirements: Requirement[]
  }>({
    iterations: [],
    requirements: []
  })

  const ganttTasks = ref<GanttTask[]>([])
  const loading = ref(false)
  const selectedTaskId = ref<string | null>(null)

  // 计算属性
  const currentViewData = computed(() => {
    return config.value.viewType === 'iteration' 
      ? rawData.value.iterations 
      : rawData.value.requirements
  })

  const filteredTasks = computed(() => {
    if (!config.value.filters || Object.keys(config.value.filters).length === 0) {
      return ganttTasks.value
    }
    
    const filtered = ganttTasks.value.filter((task: GanttTask) => {
      const filters = config.value.filters
      
      // 项目筛选 - 检查任务名称是否包含项目关键词
      if (filters.project && !task.text.toLowerCase().includes(filters.project.toLowerCase())) {
        return false
      }
      
      // 版本迭代筛选 - 仅对非人员节点生效
      if (filters.iteration && task.type !== 'project' && !task.text.toLowerCase().includes(filters.iteration.toLowerCase())) {
        return false
      }
      
      // 人员类型筛选
      if (filters.personType && task.personRole !== filters.personType) {
        return false
      }
      
      // 人员筛选
      if (filters.person && task.personId !== filters.person) {
        return false
      }
      
      // 空间类型筛选（基于工作项类型）
      if (filters.spaceType) {
        // 这里可以根据实际需求映射spaceType到workItemType
        const spaceTypeMapping: Record<string, string[]> = {
          'project': ['iteration', 'requirement'],
          'product': ['requirement'],
          'team': ['task']
        }
        const allowedTypes = spaceTypeMapping[filters.spaceType] || []
        if (task.workItemType && !allowedTypes.includes(task.workItemType)) {
          return false
        }
      }
      
      return true
    })
    
    console.log(`筛选后任务数量: ${filtered.length}/${ganttTasks.value.length}`)
    return filtered
  })

  // 操作方法
  const setViewType = (viewType: ViewType) => {
    config.value.viewType = viewType
    transformData()
  }

  const setTimeScale = (timeScale: TimeScale) => {
    config.value.timeScale = timeScale
  }

  const setFilters = (filters: Partial<FilterConfig>) => {
    config.value.filters = { ...config.value.filters, ...filters }
  }

  const clearFilters = () => {
    config.value.filters = {}
  }

  const setRawData = (data: { iterations: Iteration[], requirements: Requirement[] }) => {
    rawData.value = data
    transformData()
  }

  const transformData = () => {
    console.log('开始转换数据，当前视图类型:', config.value.viewType)
    const newTasks = config.value.viewType === 'iteration' 
      ? transformIterationsToGantt(rawData.value.iterations)
      : transformRequirementsToGantt(rawData.value.requirements)
    
    console.log('数据转换完成，任务数量:', newTasks.length)
    ganttTasks.value = newTasks
  }

  const transformIterationsToGantt = (iterations: Iteration[]): GanttTask[] => {
    const tasks: GanttTask[] = []
    const personGroups = new Map<string, Iteration[]>()

    // 按人员分组
    iterations.forEach(iteration => {
      const key = iteration.personId
      if (!personGroups.has(key)) {
        personGroups.set(key, [])
      }
      personGroups.get(key)!.push(iteration)
    })

    // 创建甘特图任务
    personGroups.forEach((iterations, personId) => {
      const firstIteration = iterations[0]
      
      // 创建人员节点
      const personTask: GanttTask = {
        id: `person_${personId}`,
        text: `人员-${firstIteration.personId}`,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        duration: 365,
        progress: 0,
        parent: '0',
        type: 'project',
        workItemType: 'iteration',
        status: 'active',
        personId: personId,
        personName: firstIteration.personId,
        personRole: firstIteration.personRole,
        readonly: true
      }
      tasks.push(personTask)

      // 创建版本迭代节点
      iterations.forEach(iteration => {
        const iterationTask: GanttTask = {
          id: iteration.id,
          text: iteration.name,
          start_date: iteration.startDate,
          end_date: iteration.endDate,
          duration: calculateDuration(iteration.startDate, iteration.endDate),
          progress: calculateProgress(iteration),
          parent: `person_${personId}`,
          type: 'task',
          workItemType: 'iteration',
          status: iteration.status,
          personId: iteration.personId,
          personName: iteration.personId,
          personRole: iteration.personRole,
          url: iteration.url,
          color: getStatusColor(iteration.status)
        }
        tasks.push(iterationTask)
      })
    })

    return tasks
  }

  const transformRequirementsToGantt = (requirements: Requirement[]): GanttTask[] => {
    const tasks: GanttTask[] = []
    const personGroups = new Map<string, Requirement[]>()

    // 按人员分组
    requirements.forEach(requirement => {
      const key = requirement.personId
      if (!personGroups.has(key)) {
        personGroups.set(key, [])
      }
      personGroups.get(key)!.push(requirement)
    })

    // 创建甘特图任务
    personGroups.forEach((requirements, personId) => {
      const firstRequirement = requirements[0]
      
      // 创建人员节点
      const personTask: GanttTask = {
        id: `person_${personId}`,
        text: `人员-${firstRequirement.personId}`,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        duration: 365,
        progress: 0,
        parent: '0',
        type: 'project',
        workItemType: 'requirement',
        status: 'active',
        personId: personId,
        personName: firstRequirement.personId,
        personRole: firstRequirement.personRole,
        readonly: true
      }
      tasks.push(personTask)

      // 创建需求节点
      requirements.forEach(requirement => {
        const requirementTask: GanttTask = {
          id: requirement.id,
          text: requirement.name,
          start_date: requirement.startDate,
          end_date: requirement.endDate,
          duration: calculateDuration(requirement.startDate, requirement.endDate),
          progress: calculateProgress(requirement),
          parent: `person_${personId}`,
          type: 'task',
          workItemType: 'requirement',
          status: requirement.status,
          personId: requirement.personId,
          personName: requirement.personId,
          personRole: requirement.personRole,
          url: requirement.url,
          color: getStatusColor(requirement.status)
        }
        tasks.push(requirementTask)

        // 创建任务节点
        if (requirement.tasks) {
          requirement.tasks.forEach(task => {
            const taskNode: GanttTask = {
              id: task.id,
              text: task.name,
              start_date: task.startDate,
              end_date: task.endDate,
              duration: calculateDuration(task.startDate, task.endDate),
              progress: 0, // 任务没有进度计算
              parent: requirement.id,
              type: 'task',
              workItemType: 'task',
              status: task.status,
              personId: task.personId,
              personName: task.personId,
              personRole: task.personRole,
              url: task.url,
              color: getStatusColor(task.status)
            }
            tasks.push(taskNode)
          })
        }
      })
    })

    return tasks
  }

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateProgress = (item: Iteration | Requirement): number => {
    if ('completedWorkItems' in item && 'totalWorkItems' in item && item.completedWorkItems && item.totalWorkItems) {
      return Math.round((item.completedWorkItems / item.totalWorkItems) * 100)
    }
    return 0
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'planning': '#faad14',
      'active': '#1890ff',
      'completed': '#52c41a',
      'cancelled': '#f5222d',
      'pending': '#d9d9d9',
      'in_progress': '#1890ff',
      'testing': '#722ed1',
      'rejected': '#f5222d',
      'todo': '#d9d9d9',
      'review': '#fa8c16',
      'done': '#52c41a'
    }
    return colorMap[status] || '#1890ff'
  }

  const selectTask = (taskId: string | null) => {
    selectedTaskId.value = taskId
  }

  return {
    // 状态
    config,
    rawData,
    ganttTasks,
    loading,
    selectedTaskId,
    
    // 计算属性
    currentViewData,
    filteredTasks,
    
    // 方法
    setViewType,
    setTimeScale,
    setFilters,
    clearFilters,
    setRawData,
    transformData,
    selectTask
  }
})