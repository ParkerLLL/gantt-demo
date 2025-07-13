<template>
  <a-modal
    v-model:open="modalVisible"
    title="人员角色详情"
    width="700px"
    :footer="null"
    :destroy-on-close="true"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div v-if="personRoles.length > 0" class="person-role-detail">
        <!-- 人员基本信息 -->
        <div class="person-info-section">
          <a-card size="small">
            <div class="person-basic-info">
              <a-avatar :size="48" :src="personInfo?.avatar">
                {{ personInfo?.name?.charAt(0) }}
              </a-avatar>
              <div class="info-details">
                <h3>{{ personInfo?.name }}</h3>
                <p>{{ personInfo?.department }} | {{ personInfo?.email }}</p>
                <div class="overall-roles">
                  <a-tag
                    v-for="role in personInfo?.roles"
                    :key="role"
                    :color="getRoleColor(role)"
                  >
                    {{ getRoleText(role) }}
                  </a-tag>
                </div>
              </div>
            </div>
          </a-card>
        </div>

        <!-- 参与的版本迭代 -->
        <div class="iterations-section">
          <h3>参与的版本迭代</h3>
          <a-table
            :data-source="personRoles"
            :columns="roleColumns"
            :pagination="{ pageSize: 10, showSizeChanger: true }"
            size="small"
          >
            <template #roles="{ record }">
              <div class="roles-cell">
                <a-tag
                  v-for="role in record.roles"
                  :key="role"
                  size="small"
                  :color="getRoleColor(role)"
                >
                  {{ getRoleText(role) }}
                </a-tag>
              </div>
            </template>

            <template #workItemCount="{ record }">
              <a-badge 
                :count="record.workItemCount" 
                :number-style="{ backgroundColor: '#52c41a' }"
                :title="`${record.workItemCount}个工作项`"
              />
            </template>

            <template #action="{ record }">
              <a-button 
                type="link" 
                size="small" 
                @click="viewIterationDetail(record.iterationId)"
              >
                查看详情
              </a-button>
            </template>
          </a-table>
        </div>

        <!-- 统计信息 -->
        <div class="statistics-section">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-card size="small">
                <a-statistic
                  title="参与版本数"
                  :value="personRoles.length"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-card>
            </a-col>
            <a-col :span="8">
              <a-card size="small">
                <a-statistic
                  title="总工作项"
                  :value="totalWorkItems"
                  :value-style="{ color: '#52c41a' }"
                />
              </a-card>
            </a-col>
            <a-col :span="8">
              <a-card size="small">
                <a-statistic
                  title="角色类型"
                  :value="uniqueRoles.length"
                  :value-style="{ color: '#722ed1' }"
                />
              </a-card>
            </a-col>
          </a-row>
        </div>

        <!-- 角色分布图 -->
        <div class="role-distribution-section">
          <h3>角色分布</h3>
          <div class="role-chart">
            <div
              v-for="(count, role) in roleDistribution"
              :key="role"
              class="role-item"
            >
              <div class="role-label">
                <a-tag :color="getRoleColor(role as PersonRole)">
                  {{ getRoleText(role as PersonRole) }}
                </a-tag>
              </div>
              <div class="role-bar">
                <div 
                  class="role-bar-fill"
                  :style="{ 
                    width: `${(count / personRoles.length) * 100}%`,
                    backgroundColor: getRoleColor(role as PersonRole)
                  }"
                ></div>
                <span class="role-count">{{ count }}</span>
              </div>
            </div>
          </div>
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
import type { PersonRoleRelation, Person, PersonRole } from '@/types'

interface Props {
  open: boolean
  personId: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'view-iteration', iterationId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const loading = ref(false)
const personRoles = ref<PersonRoleRelation[]>([])
const personInfo = ref<Person | null>(null)

// 表格列配置
const roleColumns = [
  {
    title: '版本迭代',
    dataIndex: 'iterationName',
    key: 'iterationName',
    width: 200,
    ellipsis: true
  },
  {
    title: '担任角色',
    key: 'roles',
    width: 200,
    slots: { customRender: 'roles' }
  },
  {
    title: '工作项数量',
    key: 'workItemCount',
    width: 120,
    align: 'center',
    slots: { customRender: 'workItemCount' }
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right',
    slots: { customRender: 'action' }
  }
]

// 计算属性
const totalWorkItems = computed(() => {
  return personRoles.value.reduce((total: number, relation: PersonRoleRelation) => total + relation.workItemCount, 0)
})

const uniqueRoles = computed(() => {
  const roles = new Set<PersonRole>()
  personRoles.value.forEach((relation: PersonRoleRelation) => {
    relation.roles.forEach((role: PersonRole) => roles.add(role))
  })
  return Array.from(roles)
})

const roleDistribution = computed(() => {
  const distribution: Record<string, number> = {}
  personRoles.value.forEach((relation: PersonRoleRelation) => {
    relation.roles.forEach((role: PersonRole) => {
      distribution[role] = (distribution[role] || 0) + 1
    })
  })
  return distribution
})

// 获取角色颜色
const getRoleColor = (role: PersonRole) => {
  const colorMap: Record<PersonRole, string> = {
    'developer': '#1890ff',
    'tester': '#52c41a',
    'product': '#722ed1',
    'owner': '#fa8c16',
    'creator': '#f5222d'
  }
  return colorMap[role] || '#d9d9d9'
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

// 加载人员角色数据
const loadPersonRoles = async (personId: string) => {
  loading.value = true
  try {
    // 这里应该调用真实的API
    // const response = await api.getPersonRoles(personId)
    
    // 模拟数据
    const mockPersonInfo: Person = {
      id: personId,
      name: '张三',
      email: 'zhangsan@example.com',
      department: '研发部',
      roles: ['developer', 'owner']
    }

    const mockRoles: PersonRoleRelation[] = [
      {
        personId: personId,
        personName: '张三',
        iterationId: 'iter-1',
        iterationName: 'Sprint 2024.1',
        roles: ['developer', 'owner'],
        workItemCount: 8
      },
      {
        personId: personId,
        personName: '张三',
        iterationId: 'iter-2',
        iterationName: 'Sprint 2024.2',
        roles: ['developer'],
        workItemCount: 5
      },
      {
        personId: personId,
        personName: '张三',
        iterationId: 'iter-3',
        iterationName: 'Bug Fix 2024.1',
        roles: ['developer', 'tester'],
        workItemCount: 3
      }
    ]

    personInfo.value = mockPersonInfo
    personRoles.value = mockRoles
  } catch (error) {
    console.error('加载人员角色数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 查看版本迭代详情
const viewIterationDetail = (iterationId: string) => {
  emit('view-iteration', iterationId)
  modalVisible.value = false
}

// 监听人员ID变化
watch(() => props.personId, (newId) => {
  if (newId && props.open) {
    loadPersonRoles(newId)
  }
})

// 监听弹窗开关
watch(() => props.open, (isOpen) => {
  if (isOpen && props.personId) {
    loadPersonRoles(props.personId)
  }
})
</script>

<style lang="scss" scoped>
.person-role-detail {
  .person-info-section {
    margin-bottom: 32px;

    .person-basic-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .info-details {
        flex: 1;

        h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #262626;
        }

        p {
          margin: 0 0 8px 0;
          color: #8c8c8c;
          font-size: 12px;
        }

        .overall-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }
    }
  }

  .iterations-section {
    margin-bottom: 32px;

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .roles-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .statistics-section {
    margin-bottom: 32px;

    :deep(.ant-card-body) {
      padding: 16px;
      text-align: center;
    }
  }

  .role-distribution-section {
    h3 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .role-chart {
      .role-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 16px;

        .role-label {
          width: 100px;
          flex-shrink: 0;
        }

        .role-bar {
          flex: 1;
          position: relative;
          height: 24px;
          background: #f5f5f5;
          border-radius: 4px;
          display: flex;
          align-items: center;
          padding-right: 8px;

          .role-bar-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
            opacity: 0.8;
          }

          .role-count {
            position: absolute;
            right: 8px;
            font-size: 12px;
            font-weight: 500;
            color: #262626;
          }
        }
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 32px 0;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px;
}
</style>