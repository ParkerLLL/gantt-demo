<template>
  <a-modal
    v-model:open="modalVisible"
    title="版本迭代详情"
    width="900px"
    :footer="null"
    :destroy-on-close="true"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div v-if="iterationDetail" class="iteration-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="版本名称">
              {{ iterationDetail.name }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(iterationDetail.status)">
                {{ getStatusText(iterationDetail.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="开始时间">
              {{ formatDate(iterationDetail.startDate) }}
            </a-descriptions-item>
            <a-descriptions-item label="结束时间">
              {{ formatDate(iterationDetail.endDate) }}
            </a-descriptions-item>
            <a-descriptions-item label="关联人数">
              <a-badge :count="iterationDetail.associatedPersons.length" :number-style="{ backgroundColor: '#52c41a' }" />
            </a-descriptions-item>
            <a-descriptions-item label="完成率">
              <a-progress 
                :percent="iterationDetail.completionRate" 
                :stroke-color="getProgressColor(iterationDetail.completionRate)"
                size="small"
              />
            </a-descriptions-item>
            <a-descriptions-item label="工作项统计" :span="2">
              <a-statistic-group>
                <a-statistic title="总数" :value="iterationDetail.totalWorkItems" />
                <a-statistic title="已完成" :value="iterationDetail.completedWorkItems" />
                <a-statistic 
                  title="剩余" 
                  :value="iterationDetail.totalWorkItems - iterationDetail.completedWorkItems" 
                />
              </a-statistic-group>
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="2">
              {{ iterationDetail.description || '暂无描述' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 工作项列表 -->
        <div class="detail-section">
          <h3>工作项列表</h3>
          <a-table
            :data-source="iterationDetail.workItems"
            :columns="workItemColumns"
            :pagination="{ pageSize: 10, showSizeChanger: true }"
            size="small"
            :scroll="{ x: 800 }"
          >
            <template #status="{ record }">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            
            <template #type="{ record }">
              <a-tag :color="getTypeColor(record.workItemType || 'task')">
                {{ getTypeText(record.workItemType || 'task') }}
              </a-tag>
            </template>

            <template #action="{ record }">
              <a-button type="link" size="small" @click="openWorkItemUrl(record)">
                查看详情
              </a-button>
            </template>
          </a-table>
        </div>

        <!-- 关联人员 -->
        <div class="detail-section">
          <h3>关联人员</h3>
          <div class="person-list">
            <a-card
              v-for="person in iterationDetail.associatedPersons"
              :key="person.id"
              size="small"
              class="person-card"
            >
              <div class="person-info">
                <a-avatar :src="person.avatar" :size="32">
                  {{ person.name.charAt(0) }}
                </a-avatar>
                <div class="person-details">
                  <div class="person-name">{{ person.name }}</div>
                  <div class="person-department">{{ person.department }}</div>
                  <div class="person-roles">
                    <a-tag
                      v-for="role in person.roles"
                      :key="role"
                      size="small"
                      :color="getRoleColor(role)"
                    >
                      {{ getRoleText(role) }}
                    </a-tag>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <a-space>
            <a-button type="primary" @click="openIterationUrl">
              <template #icon>
                <LinkOutlined />
              </template>
              访问版本页面
            </a-button>
            <a-button @click="closeModal">关闭</a-button>
          </a-space>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { LinkOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { IterationDetail, WorkItem, PersonRole, IterationStatus, Requirement, Task } from '@/types'

interface Props {
  open: boolean
  iterationId: string
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
const iterationDetail = ref<IterationDetail | null>(null)

// 表格列配置
const workItemColumns = [
  {
    title: '类型',
    dataIndex: 'workItemType',
    key: 'type',
    width: 80,
    slots: { customRender: 'type' }
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    slots: { customRender: 'status' }
  },
  {
    title: '开始时间',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 110,
    customRender: ({ text }: { text: string }) => formatDate(text)
  },
  {
    title: '结束时间',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 110,
    customRender: ({ text }: { text: string }) => formatDate(text)
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
]

// 格式化日期
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD')
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
    'done': 'green'
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
    'done': '已完成'
  }
  return textMap[status] || status
}

// 获取工作项类型颜色
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'iteration': 'blue',
    'requirement': 'purple',
    'task': 'orange',
    'defect': 'red'
  }
  return colorMap[type] || 'default'
}

// 获取工作项类型文本
const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'iteration': '版本迭代',
    'requirement': '需求',
    'task': '任务',
    'defect': '缺陷'
  }
  return textMap[type] || type
}

// 获取角色颜色
const getRoleColor = (role: PersonRole) => {
  const colorMap: Record<PersonRole, string> = {
    'developer': 'blue',
    'tester': 'green',
    'product': 'purple',
    'owner': 'orange',
    'creator': 'red'
  }
  return colorMap[role] || 'default'
}

// 获取角色文本
const getRoleText = (role: PersonRole) => {
  const textMap: Record<PersonRole, string> = {
    'developer': '开发人员',
    'tester': '测试人员',
    'product': '产品人员',
    'owner': '负责人',
    'creator': '创建人'
  }
  return textMap[role] || role
}

// 获取进度条颜色
const getProgressColor = (percent: number) => {
  if (percent >= 80) return '#52c41a'
  if (percent >= 60) return '#faad14'
  if (percent >= 40) return '#fa8c16'
  return '#f5222d'
}

// 加载版本迭代详情
const loadIterationDetail = async (id: string) => {
  loading.value = true
  try {
    // 这里应该调用真实的API
    // const response = await api.getIterationDetail(id)
    
    // 模拟数据
    const mockDetail: IterationDetail = {
      id: id,
      name: 'Sprint 2024.1',
      description: '第一季度功能迭代版本，包含甘特图核心功能开发',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      status: 'active' as IterationStatus,
      url: `https://example.com/iterations/${id}`,
      workItems: [
        {
          id: 'req-1',
          name: '甘特图组件开发',
          status: 'in_progress',
          startDate: '2024-01-01',
          endDate: '2024-02-15',
          priority: 'high',
          spaceType: 'project',
          spaceName: '项目空间',
          projectName: '甘特图项目',
          personId: 'user-1',
          personRole: 'developer'
        } as Requirement,
        {
          id: 'task-1',
          name: '前端组件开发',
          status: 'done',
          startDate: '2024-01-01',
          endDate: '2024-01-20',
          personId: 'user-1',
          personRole: 'developer'
        } as Task,
        {
          id: 'task-2',
          name: '后端API开发',
          status: 'in_progress',
          startDate: '2024-01-15',
          endDate: '2024-02-10',
          personId: 'user-1',
          personRole: 'developer'
        } as Task
      ],
      associatedPersons: [
        {
          id: 'user-1',
          name: '张三',
          email: 'zhangsan@example.com',
          department: '研发部',
          roles: ['developer', 'owner']
        },
        {
          id: 'user-2',
          name: '李四',
          email: 'lisi@example.com',
          department: '测试部',
          roles: ['tester']
        }
      ],
      completionRate: 65,
      totalWorkItems: 12,
      completedWorkItems: 8
    }

    iterationDetail.value = mockDetail
  } catch (error) {
    console.error('加载版本迭代详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开版本链接
const openIterationUrl = () => {
  if (iterationDetail.value?.url) {
    window.open(iterationDetail.value.url, '_blank')
  }
}

// 打开工作项链接
const openWorkItemUrl = (workItem: WorkItem) => {
  if ('url' in workItem && workItem.url) {
    window.open(workItem.url, '_blank')
  }
}

// 关闭弹窗
const closeModal = () => {
  modalVisible.value = false
}

// 监听版本ID变化
watch(() => props.iterationId, (newId) => {
  if (newId && props.open) {
    loadIterationDetail(newId)
  }
})

// 监听弹窗开关
watch(() => props.open, (isOpen) => {
  if (isOpen && props.iterationId) {
    loadIterationDetail(props.iterationId)
  }
})
</script>

<style lang="scss" scoped>
.iteration-detail {
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

  .person-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;

    .person-card {
      :deep(.ant-card-body) {
        padding: 16px;
      }
    }

    .person-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .person-details {
        flex: 1;

        .person-name {
          font-weight: 500;
          color: #262626;
          margin-bottom: 2px;
        }

        .person-department {
          font-size: 12px;
          color: #8c8c8c;
          margin-bottom: 8px;
        }

        .person-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }
    }
  }

  .detail-actions {
    text-align: right;
    padding-top: 24px;
    border-top: 1px solid #e8e8e8;
  }
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
  background-color: #fafafa;
}

:deep(.ant-statistic-group) {
  display: flex;
  gap: 24px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px;
}
</style>