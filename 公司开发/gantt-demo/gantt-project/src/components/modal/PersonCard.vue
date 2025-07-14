<template>
  <a-card :size="size" class="person-card">
    <div class="person-info">
      <a-avatar :size="avatarSize" :src="person.avatar">
        {{ person.name.charAt(0) }}
      </a-avatar>
      <div class="person-details">
        <div class="person-name">{{ person.name }}</div>
        <div class="person-department">{{ person.department }}</div>
        <div class="person-email" v-if="showEmail">{{ person.email }}</div>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Person, PersonRole } from '@/types'

interface Props {
  person: Person
  size?: 'small' | 'default'
  showEmail?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  showEmail: false
})

const avatarSize = computed(() => {
  return props.size === 'small' ? 24 : 32
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
</script>

<style lang="scss" scoped>
.person-card {
  :deep(.ant-card-body) {
    padding: 12px;
  }

  .person-info {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    .person-details {
      flex: 1;
      min-width: 0;

      .person-name {
        font-weight: 500;
        color: #262626;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .person-department {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .person-email {
        font-size: 11px;
        color: #8c8c8c;
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .person-roles {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
      }
    }
  }
}

// 小尺寸样式
.person-card[data-size="small"] {
  :deep(.ant-card-body) {
    padding: 8px;
  }

  .person-info {
    gap: 6px;

    .person-details {
      .person-name {
        font-size: 12px;
      }

      .person-department {
        font-size: 11px;
      }

      .person-email {
        font-size: 10px;
      }
    }
  }
}
</style>