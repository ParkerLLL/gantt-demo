<template>
  <div class="filter-panel">
    <a-button type="text" @click="togglePanel">
      <template #icon>
        <FilterOutlined />
      </template>
      筛选
      <a-badge :count="activeFilterCount" :offset="[8, -2]" />
    </a-button>

    <a-drawer
      v-model:open="panelVisible"
      title="数据筛选"
      placement="right"
      width="380"
      :body-style="{ padding: '24px' }"
    >
      <a-form
        :model="filterForm"
        layout="vertical"
        @finish="applyFilters"
      >
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="部门名称" name="department">
              <a-select
                v-model:value="filterForm.department"
                placeholder="请选择部门"
                allow-clear
                show-search
                :filter-option="filterOption"
              >
                <a-select-option
                  v-for="dept in departments"
                  :key="dept.value"
                  :value="dept.value"
                >
                  {{ dept.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item label="项目名称" name="project">
              <a-select
                v-model:value="filterForm.project"
                placeholder="请选择项目"
                allow-clear
                show-search
                :filter-option="filterOption"
              >
                <a-select-option
                  v-for="project in projects"
                  :key="project.value"
                  :value="project.value"
                >
                  {{ project.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item label="空间类型" name="spaceType">
              <a-select
                v-model:value="filterForm.spaceType"
                placeholder="请选择空间类型"
                allow-clear
              >
                <a-select-option
                  v-for="type in spaceTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item label="版本迭代" name="iteration">
              <a-select
                v-model:value="filterForm.iteration"
                placeholder="请选择版本迭代"
                allow-clear
                show-search
                :filter-option="filterOption"
              >
                <a-select-option
                  v-for="iteration in iterations"
                  :key="iteration.value"
                  :value="iteration.value"
                >
                  {{ iteration.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item label="人员类型" name="personType">
              <a-select
                v-model:value="filterForm.personType"
                placeholder="请选择人员类型"
                allow-clear
              >
                <a-select-option
                  v-for="type in personTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item label="人员名称" name="person">
              <a-select
                v-model:value="filterForm.person"
                placeholder="请选择人员"
                allow-clear
                show-search
                :filter-option="filterOption"
              >
                <a-select-option
                  v-for="person in persons"
                  :key="person.value"
                  :value="person.value"
                >
                  {{ person.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <div class="filter-actions">
          <a-space>
            <a-button @click="clearFilters">清空</a-button>
            <a-button type="primary" html-type="submit">应用筛选</a-button>
          </a-space>
        </div>

        <!-- 活跃筛选条件 -->
        <div v-if="hasActiveFilters" class="active-filters">
          <h4>当前筛选条件</h4>
          <div class="filter-tags">
            <a-tag
              v-for="(value, key) in activeFilters"
              :key="key"
              closable
              @close="removeFilter(key)"
            >
              {{ getFilterLabel(key) }}: {{ getFilterValueLabel(key, value) }}
            </a-tag>
          </div>
        </div>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FilterOutlined } from '@ant-design/icons-vue'
import { useFilterStore } from '@/stores/filter'
import { useGanttStore } from '@/stores/gantt'
import { storeToRefs } from 'pinia'
import type { FilterConfig } from '@/types'

const filterStore = useFilterStore()
const ganttStore = useGanttStore()
const { filters, options } = storeToRefs(filterStore)

const panelVisible = ref(false)
const filterForm = ref<FilterConfig>({})

// 计算属性
const activeFilterCount = computed(() => filterStore.activeFilterCount)
const hasActiveFilters = computed(() => filterStore.hasActiveFilters)

const activeFilters = computed(() => {
  const result: Record<string, any> = {}
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      result[key] = value
    }
  })
  return result
})

const departments = computed(() => options.value.departments)
const projects = computed(() => options.value.projects)
const spaceTypes = computed(() => options.value.spaceTypes)
const iterations = computed(() => options.value.iterations)
const personTypes = computed(() => options.value.personTypes)
const persons = computed(() => options.value.persons)

// 方法
const togglePanel = () => {
  panelVisible.value = !panelVisible.value
  if (panelVisible.value) {
    // 打开面板时同步当前筛选条件
    filterForm.value = { ...filters.value }
  }
}

const applyFilters = () => {
  // 应用筛选条件
  Object.entries(filterForm.value).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filterStore.setFilter(key as keyof FilterConfig, value)
    } else {
      filterStore.removeFilter(key as keyof FilterConfig)
    }
  })

  // 更新甘特图筛选
  ganttStore.setFilters(filters.value)
  panelVisible.value = false
}

const clearFilters = () => {
  filterForm.value = {}
  filterStore.clearAllFilters()
  ganttStore.clearFilters()
}

const removeFilter = (key: string) => {
  filterStore.removeFilter(key as keyof FilterConfig)
  ganttStore.setFilters(filters.value)
  filterForm.value = { ...filters.value }
}

const filterOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const getFilterLabel = (key: string): string => {
  const labels: Record<string, string> = {
    department: '部门',
    project: '项目',
    spaceType: '空间类型',
    iteration: '版本迭代',
    personType: '人员类型',
    person: '人员'
  }
  return labels[key] || key
}

const getFilterValueLabel = (key: string, value: any): string => {
  const optionMap: Record<string, any[]> = {
    department: departments.value,
    project: projects.value,
    spaceType: spaceTypes.value,
    iteration: iterations.value,
    personType: personTypes.value,
    person: persons.value
  }

  const optionList = optionMap[key]
  if (optionList) {
    const option = optionList.find(item => item.value === value)
    return option?.label || value
  }
  
  return value
}

// 监听筛选条件变化
watch(filters, (newFilters) => {
  if (!panelVisible.value) {
    filterForm.value = { ...newFilters }
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
.filter-panel {
  position: relative;
}

.filter-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.active-filters {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;

  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    color: #262626;
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

:deep(.ant-drawer-body) {
  padding: 24px !important;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 8px;
  
  label {
    font-weight: 500;
    color: #262626;
  }
}
</style>