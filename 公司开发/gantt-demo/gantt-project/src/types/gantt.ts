// 角色类型
export type PersonRole = 'developer' | 'tester' | 'product' | 'owner' | 'creator'

// 状态类型
export type IterationStatus = 'planning' | 'active' | 'completed' | 'cancelled'
export type RequirementStatus = 'pending' | 'in_progress' | 'testing' | 'completed' | 'rejected'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type DefectStatus = 'open' | 'fixed' | 'verified' | 'closed' | 'rejected'

// 空间类型
export type SpaceType = 'project' | 'product' | 'team'

// 工作项类型
export type WorkItemType = 'iteration' | 'requirement' | 'task' | 'defect'

// 人员信息
export interface Person {
  id: string
  name: string
  avatar?: string
  email: string
  department: string
  roles: PersonRole[]
}

// 版本迭代
export interface Iteration {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: IterationStatus
  spaceType: SpaceType
  spaceName: string
  projectName: string
  url?: string
  personId: string
  personRole: PersonRole
  workItems?: WorkItem[]
  totalWorkItems?: number
  completedWorkItems?: number
  associatedPersons?: number
}

// 需求
export interface Requirement {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: RequirementStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  spaceType: SpaceType
  spaceName: string
  projectName: string
  iterationId?: string
  iterationName?: string
  personId: string
  personRole: PersonRole
  tasks?: Task[]
  url?: string
}

// 任务
export interface Task {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: TaskStatus
  estimatedHours?: number
  actualHours?: number
  requirementId?: string
  requirementName?: string
  iterationId?: string
  iterationName?: string
  personId: string
  personRole: PersonRole
  url?: string
}

// 缺陷
export interface Defect {
  id: string
  name: string
  description?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: DefectStatus
  foundDate: string
  fixedDate?: string
  iterationId?: string
  iterationName?: string
  reporterId: string
  assigneeId: string
  url?: string
}

// 工作项联合类型
export type WorkItem = Iteration | Requirement | Task | Defect

// 甘特图任务格式
export interface GanttTask {
  id: string
  text: string
  start_date: string
  end_date: string
  duration: number
  progress: number
  parent: string
  type: 'project' | 'task' | 'milestone'
  color?: string
  textColor?: string
  // 自定义属性
  workItemType: WorkItemType
  status: string
  personId: string
  personName: string
  personRole: PersonRole
  url?: string
  readonly?: boolean
}

// 视图类型
export type ViewType = 'iteration' | 'requirement'

// 时间刻度类型
export type TimeScale = 'year' | 'quarter' | 'month' | 'week' | 'day'

// 筛选配置
export interface FilterConfig {
  department?: string
  project?: string
  spaceType?: SpaceType
  iteration?: string
  personType?: PersonRole
  person?: string
}

// 人员角色关系
export interface PersonRoleRelation {
  personId: string
  personName: string
  iterationId: string
  iterationName: string
  roles: PersonRole[]
  workItemCount: number
}

// 版本迭代详情
export interface IterationDetail {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: IterationStatus
  url?: string
  workItems: WorkItem[]
  associatedPersons: Person[]
  completionRate: number
  totalWorkItems: number
  completedWorkItems: number
}

// 甘特图配置
export interface GanttConfig {
  viewType: ViewType
  timeScale: TimeScale
  filters: FilterConfig
  showWeekends: boolean
  showCriticalPath: boolean
}