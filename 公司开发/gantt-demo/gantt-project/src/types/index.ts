// 导出所有类型定义
export * from './gantt'
export * from './api'

// 通用类型
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  children?: SelectOption[]
}

// 菜单项类型
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

// 表格列配置
export interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  sorter?: boolean
  filters?: { text: string; value: any }[]
  render?: (value: any, record: any, index: number) => any
}