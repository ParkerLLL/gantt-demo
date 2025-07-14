<template>
  <div class="gantt-page">
    <div class="gantt-header">
      <div class="header-left">
        <h2>甘特图管理</h2>
        <div class="view-switcher">
          <a-radio-group v-model:value="viewType" button-style="solid" @change="handleViewChange">
            <a-radio-button value="iteration">版本迭代视图</a-radio-button>
            <a-radio-button value="requirement">需求任务视图</a-radio-button>
          </a-radio-group>
        </div>
      </div>
      
      <div class="header-right">
        <FilterPanel />
        <TimeScaleController />
        <a-button type="primary" @click="refreshData">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
      </div>
    </div>

    <div class="gantt-content">
      <!-- 视图状态指示 -->
      <div class="view-indicator">
        <a-tag :color="viewType === 'iteration' ? 'blue' : 'purple'" size="large">
          {{ viewType === 'iteration' ? '当前视图：人员 → 版本迭代' : '当前视图：人员 → 需求 → 任务' }}
        </a-tag>
        <a-tag v-if="ganttStore.ganttTasks.length > 0" color="green">
          总数据: {{ ganttStore.ganttTasks.length }}
        </a-tag>
        <a-tag v-if="ganttStore.filteredTasks.length !== ganttStore.ganttTasks.length" color="orange">
          筛选后: {{ ganttStore.filteredTasks.length }}
        </a-tag>
        <a-tag v-if="filterStore.hasActiveFilters" color="red">
          {{ filterStore.activeFilterCount }} 个筛选条件
        </a-tag>
      </div>
      
      <BasicGantt 
        @iteration-click="handleIterationClick"
        @person-click="handlePersonClick"
        @task-click="handleTaskClick"
      />
      <!-- <TestComponent /> -->
      <!-- <SimpleGantt /> -->
      <!-- <GanttChart /> -->
    </div>

    <!-- 详情弹窗 -->
    <IterationDetailModal 
      v-model:open="detailModalVisible" 
      :iteration-id="selectedIterationId"
    />
    
    <PersonRoleModal 
      v-model:open="personModalVisible" 
      :person-id="selectedPersonId"
      @view-iteration="handleIterationClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useGanttStore } from '@/stores/gantt'
import { useFilterStore } from '@/stores/filter'
import { storeToRefs } from 'pinia'
import TestComponent from '@/components/TestComponent.vue'
import BasicGantt from '@/components/gantt/BasicGantt.vue'
// import SimpleGantt from '@/components/gantt/SimpleGantt.vue'
// import GanttChart from '@/components/gantt/GanttChart.vue'
import FilterPanel from '@/components/filter/FilterPanel.vue'
import TimeScaleController from '@/components/gantt/TimeScaleController.vue'
import IterationDetailModal from '@/components/modal/IterationDetailModal.vue'
import PersonRoleModal from '@/components/modal/PersonRoleModal.vue'
import { getSimpleTestData } from '@/mock/simple-data'
import type { ViewType } from '@/types'

const ganttStore = useGanttStore()
const filterStore = useFilterStore()
const { config } = storeToRefs(ganttStore)

// 响应式数据 - 与store同步
const viewType = ref<ViewType>(config.value.viewType)
const detailModalVisible = ref(false)
const personModalVisible = ref(false)
const selectedIterationId = ref<string>('')
const selectedPersonId = ref<string>('')

// 方法
const handleViewChange = (e: any) => {
  const newViewType = e.target.value as ViewType
  console.log('视图切换到:', newViewType)
  
  // 更新store中的viewType，这会触发数据转换
  ganttStore.setViewType(newViewType)
  
  // 同步本地viewType
  viewType.value = newViewType
}

const refreshData = async () => {
  ganttStore.loading = true
  try {
    console.log('开始加载测试数据...')
    const testData = getSimpleTestData()
    console.log('测试数据加载完成:', testData)
    
    // 设置原始数据，这会触发数据转换
    ganttStore.setRawData(testData)
    
    // 更新筛选选项
    filterStore.updateOptionsFromData(testData)
    
    // 确保视图类型与store同步
    if (config.value.viewType !== viewType.value) {
      ganttStore.setViewType(viewType.value)
    }
    
    console.log('甘特图任务数据:', ganttStore.ganttTasks)
    console.log('当前视图类型:', config.value.viewType)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    ganttStore.loading = false
  }
}

// 监听store中viewType的变化，保持同步
watch(() => config.value.viewType, (newViewType) => {
  if (viewType.value !== newViewType) {
    console.log('store中viewType变化:', newViewType)
    viewType.value = newViewType
  }
})

// 甘特图点击事件处理
const handleIterationClick = (iterationId: string) => {
  console.log('打开版本迭代详情:', iterationId)
  selectedIterationId.value = iterationId
  detailModalVisible.value = true
}

const handlePersonClick = (personId: string) => {
  console.log('打开人员角色详情:', personId)
  selectedPersonId.value = personId
  personModalVisible.value = true
}

const handleTaskClick = (data: { id: string, type: string, workItemType?: string }) => {
  console.log('任务点击:', data)
  // 可以根据workItemType进行不同的处理
  if (data.workItemType === 'iteration') {
    handleIterationClick(data.id)
  }
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style lang="scss" scoped>
.gantt-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
  gap: 16px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;

    h2 {
      margin: 0;
      color: #262626;
      font-size: 18px;
      
      @media (max-width: 768px) {
        font-size: 16px;
      }
    }
    
    .view-switcher {
      @media (max-width: 640px) {
        order: 2;
        flex-basis: 100%;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      gap: 12px;
    }
    
    @media (max-width: 640px) {
      flex-basis: 100%;
      justify-content: space-between;
    }
  }
}

.gantt-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
  
  .view-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      gap: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    
    @media (max-width: 480px) {
      gap: 6px;
      padding: 8px 10px;
      margin-bottom: 10px;
    }
  }
}
</style>