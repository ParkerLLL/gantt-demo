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
      <BasicGantt />
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
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useGanttStore } from '@/stores/gantt'
import { useFilterStore } from '@/stores/filter'
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

// 响应式数据
const viewType = ref<ViewType>('iteration')
const detailModalVisible = ref(false)
const personModalVisible = ref(false)
const selectedIterationId = ref<string>('')
const selectedPersonId = ref<string>('')

// 方法
const handleViewChange = (e: any) => {
  const newViewType = e.target.value as ViewType
  ganttStore.setViewType(newViewType)
}

const refreshData = async () => {
  ganttStore.loading = true
  try {
    console.log('开始加载测试数据...')
    const testData = getSimpleTestData()
    console.log('测试数据加载完成:', testData)
    ganttStore.setRawData(testData)
    console.log('甘特图任务数据:', ganttStore.ganttTasks)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    ganttStore.loading = false
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

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;

    h2 {
      margin: 0;
      color: #262626;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.gantt-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}
</style>