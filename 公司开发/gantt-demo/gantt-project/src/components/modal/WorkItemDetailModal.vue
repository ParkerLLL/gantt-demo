<template>
  <a-modal
    v-model:open="modalVisible"
    title="工作项详情"
    width="800px"
    :footer="null"
    :destroy-on-close="true"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div v-if="workItemDetail" class="work-item-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="工作项编号">
              <a-tag color="blue">{{ workItemDetail.number }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="类型">
              <a-tag :color="getTypeColor(workItemDetail.workItemType)">
                {{ getTypeText(workItemDetail.workItemType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="标题" :span="2">
              {{ workItemDetail.title }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(workItemDetail.status)">
                {{ getStatusText(workItemDetail.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="优先级" v-if="workItemDetail.priority">
              <a-tag :color="getPriorityColor(workItemDetail.priority)">
                {{ getPriorityText(workItemDetail.priority) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ formatDate(workItemDetail.createTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="末次变更时间">
              {{ formatDate(workItemDetail.lastChangeTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="所属空间" v-if="workItemDetail.spaceName">
              <a-tag :color="getSpaceTypeColor(workItemDetail.spaceType)">
                {{ workItemDetail.spaceName }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="所属项目" v-if="workItemDetail.projectName">
              {{ workItemDetail.projectName }}
            </a-descriptions-item>
            <a-descriptions-item label="所属版本迭代" v-if="workItemDetail.iterationName">
              {{ workItemDetail.iterationName }}
            </a-descriptions-item>
            <a-descriptions-item label="所属需求" v-if="workItemDetail.requirementName">
              {{ workItemDetail.requirementName }}
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="2" v-if="workItemDetail.description">
              {{ workItemDetail.description }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 人员信息 -->
        <div class="detail-section">
          <h3>相关人员</h3>
          <div class="person-roles">
            <!-- 创建人 -->
            <div class="person-role-item">
              <div class="role-title">
                <UserAddOutlined />
                创建人
              </div>
              <PersonCard :person="workItemDetail.creator" />
            </div>

            <!-- 开发人员 -->
            <div class="person-role-item" v-if="workItemDetail.developer">
              <div class="role-title">
                <CodeOutlined />
                开发人员
              </div>
              <PersonCard :person="workItemDetail.developer" />
            </div>

            <!-- 测试人员 -->
            <div class="person-role-item" v-if="workItemDetail.tester">
              <div class="role-title">
                <BugOutlined />
                测试人员
              </div>
              <PersonCard :person="workItemDetail.tester" />
            </div>

            <!-- 产品人员 -->
            <div class="person-role-item" v-if="workItemDetail.productManager">
              <div class="role-title">
                <ProjectOutlined />
                产品人员
              </div>
              <PersonCard :person="workItemDetail.productManager" />
            </div>

            <!-- 经办人 -->
            <div class="person-role-item" v-if="workItemDetail.assignees.length > 0">
              <div class="role-title">
                <TeamOutlined />
                经办人 ({{ workItemDetail.assignees.length }})
              </div>
              <div class="assignees-list">
                <PersonCard 
                  v-for="assignee in workItemDetail.assignees" 
                  :key="assignee.id" 
                  :person="assignee" 
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <a-space>
            <a-button type="primary" @click="openWorkItemUrl" v-if="workItemDetail.url">
              <template #icon>
                <LinkOutlined />
              </template>
              访问工作项页面
            </a-button>
            <a-button @click="closeModal">关闭</a-button>
          </a-space>
        </div>
      </div>

      <div v-else class="empty-state">
        <a-empty description="暂无数据" />
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  LinkOutlined, 
  UserAddOutlined, 
  CodeOutlined, 
  BugOutlined, 
  ProjectOutlined, 
  TeamOutlined 
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import PersonCard from './PersonCard.vue'
import type { WorkItemDetail, WorkItemType, SpaceType, Person } from '@/types'

interface Props {
  open: boolean
  workItemId: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const loading = ref(false)
const workItemDetail = ref<WorkItemDetail | null>(null)

// 格式化日期
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'planning': 'orange',
    'active': 'blue',
    'completed': 'green',
    'cancelled': 'red',
    'pending': 'default',
    'in_progress': 'blue',
    'testing': 'purple',
    'rejected': 'red',
    'done': 'green',
    'todo': 'default',
    'review': 'orange'
  }
  return colorMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'planning': '规划中',
    'active': '进行中',
    'completed': '已完成',
    'cancelled': '已取消',
    'pending': '待处理',
    'in_progress': '进行中',
    'testing': '测试中',
    'rejected': '已拒绝',
    'done': '已完成',
    'todo': '待办',
    'review': '评审中'
  }
  return textMap[status] || status
}

// 获取工作项类型颜色
const getTypeColor = (type: WorkItemType) => {
  const colorMap: Record<WorkItemType, string> = {
    'iteration': 'blue',
    'requirement': 'purple',
    'task': 'orange',
    'defect': 'red'
  }
  return colorMap[type] || 'default'
}

// 获取工作项类型文本
const getTypeText = (type: WorkItemType) => {
  const textMap: Record<WorkItemType, string> = {
    'iteration': '版本迭代',
    'requirement': '需求',
    'task': '任务',
    'defect': '缺陷'
  }
  return textMap[type] || type
}

// 获取优先级颜色
const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    'urgent': 'red',
    'high': 'orange',
    'medium': 'blue',
    'low': 'default'
  }
  return colorMap[priority] || 'default'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    'urgent': '紧急',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[priority] || priority
}

// 获取空间类型颜色
const getSpaceTypeColor = (spaceType?: SpaceType) => {
  if (!spaceType) return 'default'
  const colorMap: Record<SpaceType, string> = {
    'project': 'blue',
    'product': 'purple',
    'team': 'green'
  }
  return colorMap[spaceType] || 'default'
}

// 加载工作项详情
const loadWorkItemDetail = async (id: string) => {
  loading.value = true
  try {
    // 这里应该调用真实的API
    // const response = await api.getWorkItemDetail(id)
    
    // 模拟数据
    const mockDetail: WorkItemDetail = {
      id: id,
      number: 'WI-2024-001',
      title: '实现甘特图时间刻度切换功能',
      workItemType: 'task',
      status: 'in_progress',
      createTime: '2024-01-01 09:00:00',
      lastChangeTime: '2024-01-15 14:30:00',
      creator: {
        id: 'user-1',
        name: '张三',
        email: 'zhangsan@example.com',
        department: '研发部',
        roles: ['developer']
      },
      developer: {
        id: 'user-2',
        name: '李四',
        email: 'lisi@example.com',
        department: '研发部',
        roles: ['developer']
      },
      tester: {
        id: 'user-3',
        name: '王五',
        email: 'wangwu@example.com',
        department: '测试部',
        roles: ['tester']
      },
      productManager: {
        id: 'user-4',
        name: '赵六',
        email: 'zhaoliu@example.com',
        department: '产品部',
        roles: ['product']
      },
      assignees: [
        {
          id: 'user-2',
          name: '李四',
          email: 'lisi@example.com',
          department: '研发部',
          roles: ['developer']
        },
        {
          id: 'user-5',
          name: '钱七',
          email: 'qianqi@example.com',
          department: '研发部',
          roles: ['developer']
        }
      ],
      url: `https://example.com/work-items/${id}`,
      description: '实现甘特图组件的时间刻度切换功能，支持年、季度、月、周、日等多种时间维度的切换，提升用户体验。',
      priority: 'high',
      spaceType: 'project',
      spaceName: '甘特图项目空间',
      projectName: '甘特图管理系统',
      iterationName: 'Sprint 2024.1',
      requirementName: '甘特图核心功能开发'
    }

    workItemDetail.value = mockDetail
  } catch (error) {
    console.error('加载工作项详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开工作项链接
const openWorkItemUrl = () => {
  if (workItemDetail.value?.url) {
    window.open(workItemDetail.value.url, '_blank')
  }
}

// 关闭弹窗
const closeModal = () => {
  modalVisible.value = false
}

// 监听工作项ID变化
watch(() => props.workItemId, (newId) => {
  if (newId && props.open) {
    loadWorkItemDetail(newId)
  }
})

// 监听弹窗开关
watch(() => props.open, (isOpen) => {
  if (isOpen && props.workItemId) {
    loadWorkItemDetail(props.workItemId)
  }
})
</script>

<style lang="scss" scoped>
.work-item-detail {
  .detail-section {
    margin-bottom: 32px;

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 8px;
    }
  }

  .person-roles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;

    .person-role-item {
      .role-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 500;
        color: #595959;
        font-size: 14px;

        .anticon {
          color: #1890ff;
        }
      }

      .assignees-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }

  .detail-actions {
    text-align: right;
    padding-top: 24px;
    border-top: 1px solid #e8e8e8;
  }
}

.empty-state {
  text-align: center;
  padding: 32px 0;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
  background-color: #fafafa;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px;
}
</style>