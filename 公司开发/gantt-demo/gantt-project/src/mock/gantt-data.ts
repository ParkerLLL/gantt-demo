import type { 
  Iteration, 
  Requirement, 
  Task, 
  Person,
  IterationStatus,
  RequirementStatus,
  TaskStatus,
  PersonRole,
  SpaceType
} from '@/types'

// 生成随机日期
const generateRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split('T')[0]
}

// 生成随机状态
const getRandomStatus = <T extends string>(statuses: T[]): T => {
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// 生成人员数据
const generatePersons = (): Person[] => {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  const departments = ['研发部', '产品部', '测试部', '运营部']
  const roles: PersonRole[] = ['developer', 'tester', 'product', 'owner', 'creator']

  return names.map((name, index) => ({
    id: `person-${index + 1}`,
    name,
    email: `${name.toLowerCase()}@example.com`,
    department: departments[index % departments.length],
    roles: [roles[index % roles.length], roles[(index + 1) % roles.length]].slice(0, Math.random() > 0.5 ? 1 : 2)
  }))
}

// 生成版本迭代数据
const generateIterations = (persons: Person[]): Iteration[] => {
  const iterationNames = [
    'Sprint 2024.1', 'Sprint 2024.2', 'Sprint 2024.3', 'Sprint 2024.4',
    'Bug Fix 2024.1', 'Bug Fix 2024.2', 'Release 1.0', 'Release 1.1',
    'Feature Sprint Q1', 'Feature Sprint Q2', 'Hotfix 2024.1', 'Hotfix 2024.2'
  ]
  
  const projects = ['甘特图项目', '管理系统', '移动端应用']
  const spaceTypes: SpaceType[] = ['project', 'product', 'team']
  const statuses: IterationStatus[] = ['planning', 'active', 'completed', 'cancelled']

  const iterations: Iteration[] = []
  
  persons.forEach(person => {
    const iterationCount = Math.floor(Math.random() * 4) + 2 // 每人2-5个版本迭代
    
    for (let i = 0; i < iterationCount; i++) {
      const startDate = generateRandomDate(new Date('2024-01-01'), new Date('2024-06-01'))
      const endDate = generateRandomDate(new Date(startDate), new Date('2024-12-31'))
      
      iterations.push({
        id: `iteration-${person.id}-${i + 1}`,
        name: iterationNames[Math.floor(Math.random() * iterationNames.length)],
        description: `${person.name}负责的版本迭代`,
        startDate,
        endDate,
        status: getRandomStatus(statuses),
        spaceType: getRandomStatus(spaceTypes),
        spaceName: `${projects[Math.floor(Math.random() * projects.length)]}空间`,
        projectName: projects[Math.floor(Math.random() * projects.length)],
        url: `https://example.com/iterations/iteration-${person.id}-${i + 1}`,
        personId: person.id,
        personRole: person.roles[Math.floor(Math.random() * person.roles.length)],
        totalWorkItems: Math.floor(Math.random() * 20) + 5,
        completedWorkItems: Math.floor(Math.random() * 15) + 2,
        associatedPersons: Math.floor(Math.random() * 5) + 2
      })
    }
  })

  return iterations
}

// 生成需求数据
const generateRequirements = (persons: Person[], iterations: Iteration[]): Requirement[] => {
  const requirementNames = [
    '甘特图组件开发', '筛选功能实现', '时间视图切换', '详情弹窗开发',
    '用户权限管理', '数据导出功能', '移动端适配', '性能优化',
    '界面美化', '多语言支持', '数据统计', '报表生成'
  ]
  
  const priorities = ['low', 'medium', 'high', 'urgent']
  const statuses: RequirementStatus[] = ['pending', 'in_progress', 'testing', 'completed', 'rejected']

  const requirements: Requirement[] = []
  
  persons.forEach(person => {
    const requirementCount = Math.floor(Math.random() * 5) + 3 // 每人3-7个需求
    
    for (let i = 0; i < requirementCount; i++) {
      const relatedIteration = iterations.find(iter => iter.personId === person.id)
      const startDate = generateRandomDate(new Date('2024-01-01'), new Date('2024-06-01'))
      const endDate = generateRandomDate(new Date(startDate), new Date('2024-12-31'))
      
      const requirement: Requirement = {
        id: `requirement-${person.id}-${i + 1}`,
        name: requirementNames[Math.floor(Math.random() * requirementNames.length)],
        description: `${person.name}负责的需求`,
        startDate,
        endDate,
        status: getRandomStatus(statuses),
        priority: getRandomStatus(priorities) as 'low' | 'medium' | 'high' | 'urgent',
        spaceType: relatedIteration?.spaceType || 'project',
        spaceName: relatedIteration?.spaceName || '默认空间',
        projectName: relatedIteration?.projectName || '默认项目',
        iterationId: relatedIteration?.id,
        iterationName: relatedIteration?.name,
        personId: person.id,
        personRole: person.roles[Math.floor(Math.random() * person.roles.length)],
        url: `https://example.com/requirements/requirement-${person.id}-${i + 1}`
      }

      // 为需求生成任务
      const taskCount = Math.floor(Math.random() * 3) + 1 // 每个需求1-3个任务
      const tasks: Task[] = []
      
      for (let j = 0; j < taskCount; j++) {
        const taskStatuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']
        const taskStartDate = generateRandomDate(new Date(requirement.startDate), new Date(requirement.endDate))
        const taskEndDate = generateRandomDate(new Date(taskStartDate), new Date(requirement.endDate))
        
        tasks.push({
          id: `task-${requirement.id}-${j + 1}`,
          name: `${requirement.name} - 子任务${j + 1}`,
          description: `${requirement.name}的具体实现任务`,
          startDate: taskStartDate,
          endDate: taskEndDate,
          status: getRandomStatus(taskStatuses),
          estimatedHours: Math.floor(Math.random() * 40) + 8,
          actualHours: Math.floor(Math.random() * 35) + 5,
          requirementId: requirement.id,
          requirementName: requirement.name,
          iterationId: requirement.iterationId,
          iterationName: requirement.iterationName,
          personId: person.id,
          personRole: person.roles[Math.floor(Math.random() * person.roles.length)],
          url: `https://example.com/tasks/task-${requirement.id}-${j + 1}`
        })
      }
      
      requirement.tasks = tasks
      requirements.push(requirement)
    }
  })

  return requirements
}

// 主要的数据加载函数
export const loadMockData = async (): Promise<{
  iterations: Iteration[]
  requirements: Requirement[]
}> => {
  // 模拟异步加载
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const persons = generatePersons()
  const iterations = generateIterations(persons)
  const requirements = generateRequirements(persons, iterations)
  
  return {
    iterations,
    requirements
  }
}

// 导出其他有用的数据
export const getMockPersons = (): Person[] => {
  return generatePersons()
}

export const getMockProjects = () => {
  return [
    { label: '甘特图项目', value: 'gantt-project' },
    { label: '管理系统', value: 'management-system' },
    { label: '移动端应用', value: 'mobile-app' }
  ]
}

export const getMockDepartments = () => {
  return [
    { label: '研发部', value: 'rd' },
    { label: '产品部', value: 'product' },
    { label: '测试部', value: 'qa' },
    { label: '运营部', value: 'ops' }
  ]
}