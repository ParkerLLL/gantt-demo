import type { Iteration, Requirement } from '@/types'

// 简单的测试数据
export const getSimpleTestData = () => {
  const iterations: Iteration[] = [
    {
      id: 'iter-1',
      name: 'Sprint 2024.1',
      description: '第一个迭代版本',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'active',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图项目',
      url: 'https://example.com/iterations/iter-1',
      personId: 'person-1',
      personRole: 'developer',
      totalWorkItems: 10,
      completedWorkItems: 6,
      associatedPersons: 3
    },
    {
      id: 'iter-2',
      name: 'Sprint 2024.2',
      description: '第二个迭代版本',
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      status: 'planning',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图项目',
      url: 'https://example.com/iterations/iter-2',
      personId: 'person-1',
      personRole: 'owner',
      totalWorkItems: 8,
      completedWorkItems: 2,
      associatedPersons: 2
    },
    {
      id: 'iter-3',
      name: 'Bug Fix 2024.1',
      description: '缺陷修复版本',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'completed',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图项目',
      url: 'https://example.com/iterations/iter-3',
      personId: 'person-2',
      personRole: 'tester',
      totalWorkItems: 5,
      completedWorkItems: 5,
      associatedPersons: 1
    }
  ]

  const requirements: Requirement[] = [
    {
      id: 'req-1',
      name: '甘特图组件开发',
      description: '开发甘特图核心组件',
      startDate: '2024-01-01',
      endDate: '2024-01-20',
      status: 'completed',
      priority: 'high',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图项目',
      iterationId: 'iter-1',
      iterationName: 'Sprint 2024.1',
      personId: 'person-1',
      personRole: 'developer',
      url: 'https://example.com/requirements/req-1',
      tasks: [
        {
          id: 'task-1',
          name: '前端组件开发',
          description: '开发Vue3甘特图组件',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
          status: 'done',
          estimatedHours: 40,
          actualHours: 35,
          requirementId: 'req-1',
          requirementName: '甘特图组件开发',
          iterationId: 'iter-1',
          iterationName: 'Sprint 2024.1',
          personId: 'person-1',
          personRole: 'developer',
          url: 'https://example.com/tasks/task-1'
        },
        {
          id: 'task-2',
          name: '数据处理逻辑',
          description: '实现数据转换和处理',
          startDate: '2024-01-11',
          endDate: '2024-01-20',
          status: 'done',
          estimatedHours: 30,
          actualHours: 28,
          requirementId: 'req-1',
          requirementName: '甘特图组件开发',
          iterationId: 'iter-1',
          iterationName: 'Sprint 2024.1',
          personId: 'person-1',
          personRole: 'developer',
          url: 'https://example.com/tasks/task-2'
        }
      ]
    },
    {
      id: 'req-2',
      name: '筛选功能实现',
      description: '实现多维度筛选功能',
      startDate: '2024-01-21',
      endDate: '2024-02-10',
      status: 'in_progress',
      priority: 'medium',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图项目',
      iterationId: 'iter-2',
      iterationName: 'Sprint 2024.2',
      personId: 'person-1',
      personRole: 'developer',
      url: 'https://example.com/requirements/req-2',
      tasks: [
        {
          id: 'task-3',
          name: '筛选面板开发',
          description: '开发筛选UI组件',
          startDate: '2024-01-21',
          endDate: '2024-01-31',
          status: 'in_progress',
          estimatedHours: 24,
          actualHours: 18,
          requirementId: 'req-2',
          requirementName: '筛选功能实现',
          iterationId: 'iter-2',
          iterationName: 'Sprint 2024.2',
          personId: 'person-1',
          personRole: 'developer',
          url: 'https://example.com/tasks/task-3'
        }
      ]
    },
    {
      id: 'req-3',
      name: '测试用例编写',
      description: '编写自动化测试用例',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'completed',
      priority: 'medium',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图项目',
      iterationId: 'iter-3',
      iterationName: 'Bug Fix 2024.1',
      personId: 'person-2',
      personRole: 'tester',
      url: 'https://example.com/requirements/req-3',
      tasks: []
    }
  ]

  return { iterations, requirements }
}