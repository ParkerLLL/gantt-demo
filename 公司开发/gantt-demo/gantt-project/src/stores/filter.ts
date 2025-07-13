import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FilterConfig, SelectOption, PersonRole } from '@/types'

export const useFilterStore = defineStore('filter', () => {
  // 状态
  const filters = ref<FilterConfig>({})
  
  // 筛选选项数据
  const options = ref({
    departments: [] as SelectOption[],
    projects: [] as SelectOption[],
    spaceTypes: [] as SelectOption[],
    iterations: [] as SelectOption[],
    personTypes: [] as SelectOption[],
    persons: [] as SelectOption[]
  })

  // 计算属性
  const hasActiveFilters = computed(() => {
    return Object.values(filters.value).some(value => value !== undefined && value !== '')
  })

  const activeFilterCount = computed(() => {
    return Object.values(filters.value).filter(value => value !== undefined && value !== '').length
  })

  // 方法
  const setFilter = (key: keyof FilterConfig, value: any) => {
    filters.value[key] = value
  }

  const removeFilter = (key: keyof FilterConfig) => {
    delete filters.value[key]
  }

  const clearAllFilters = () => {
    filters.value = {}
  }

  const setOptions = (type: keyof typeof options.value, data: SelectOption[]) => {
    options.value[type] = data
  }

  // 初始化筛选选项
  const initOptions = () => {
    // 部门选项
    options.value.departments = [
      { label: '研发部', value: 'rd' },
      { label: '产品部', value: 'product' },
      { label: '测试部', value: 'qa' },
      { label: '运营部', value: 'ops' }
    ]

    // 项目选项
    options.value.projects = [
      { label: '甘特图项目', value: 'gantt-project' },
      { label: '管理系统', value: 'management-system' },
      { label: '移动端应用', value: 'mobile-app' }
    ]

    // 空间类型选项
    options.value.spaceTypes = [
      { label: '项目空间', value: 'project' },
      { label: '产品空间', value: 'product' },
      { label: '团队空间', value: 'team' }
    ]

    // 人员类型选项
    const personTypeLabels: Record<PersonRole, string> = {
      developer: '开发人员',
      tester: '测试人员',
      product: '产品人员',
      owner: '负责人',
      creator: '创建人'
    }

    options.value.personTypes = Object.entries(personTypeLabels).map(([value, label]) => ({
      label,
      value: value as PersonRole
    }))
  }

  // 获取筛选后的选项
  const getFilteredOptions = (type: keyof typeof options.value, searchValue?: string) => {
    const optionList = options.value[type]
    if (!searchValue) return optionList

    return optionList.filter((option: SelectOption) => 
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }

  // 构建筛选查询参数
  const buildQueryParams = () => {
    const params: Record<string, any> = {}
    
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params[key] = value
      }
    })

    return params
  }

  // 初始化
  initOptions()

  return {
    // 状态
    filters,
    options,
    
    // 计算属性
    hasActiveFilters,
    activeFilterCount,
    
    // 方法
    setFilter,
    removeFilter,
    clearAllFilters,
    setOptions,
    getFilteredOptions,
    buildQueryParams
  }
})