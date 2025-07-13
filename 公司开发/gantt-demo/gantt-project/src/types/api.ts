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

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  details?: any
}