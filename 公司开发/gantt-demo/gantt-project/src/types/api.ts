// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 筛选参数
export interface FilterParams {
  department?: string
  project?: string
  spaceType?: string
  iteration?: string
  personType?: string
  person?: string
  startDate?: string
  endDate?: string
}

// 甘特图数据请求参数
export interface GanttDataParams extends FilterParams {
  viewType: 'iteration' | 'requirement'
  timeRange?: {
    start: string
    end: string
  }
}

// 人员查询参数
export interface PersonQueryParams {
  department?: string
  role?: string
  keyword?: string
}

// 版本迭代查询参数
export interface IterationQueryParams extends PaginationParams {
  status?: string
  project?: string
  personId?: string
  keyword?: string
}

// 需求查询参数
export interface RequirementQueryParams extends PaginationParams {
  status?: string
  priority?: string
  iterationId?: string
  personId?: string
  keyword?: string
}

// 甘特图数据请求参数 (新增)
export interface GanttDataRequest {
  viewType: 'iteration' | 'requirement'
  page: number
  pageSize: number
  
  filters?: {
    department?: string
    project?: string
    spaceType?: 'project' | 'product' | 'team'
    iteration?: string
    personType?: string
    person?: string
    dateRange?: {
      startDate: string
      endDate: string
    }
  }
  
  expand?: {
    personIds?: string[]
    maxItemsPerPerson?: number
  }
}

// 甘特图数据响应 (新增)
export interface GanttDataResponse {
  persons: PersonGanttData[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalPersons: number
    totalWorkItems: number
    dataRange: {
      minDate: string
      maxDate: string
    }
  }
}

// 人员甘特图数据 (新增)
export interface PersonGanttData {
  personId: string
  personName: string
  personRole: string
  department: string
  workItems: WorkItemGanttData[]
  stats: {
    totalItems: number
    loadedItems: number
    hasMore: boolean
  }
}

// 工作项甘特图数据 (新增)
export interface WorkItemGanttData {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  workItemType: string
  progress?: number
  parentId?: string
  children?: WorkItemGanttData[]
  hasChildren?: boolean
  url?: string
  color?: string
  readonly?: boolean
}

// 懒加载请求参数 (新增)
export interface LazyLoadRequest {
  parentId?: string
  viewType: 'iteration' | 'requirement'
  limit?: number
}

// 懒加载响应 (新增)
export interface LazyLoadResponse {
  parentId: string | null
  children: WorkItemGanttData[]
  hasMore: boolean
  total: number
}

// 筛选选项响应 (新增)
export interface FilterOptionsResponse {
  departments: SelectOption[]
  projects: SelectOption[]
  spaceTypes: SelectOption[]
  iterations: SelectOption[]
  personTypes: SelectOption[]
  persons: SelectOption[]
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  count?: number
}

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  details?: any
}