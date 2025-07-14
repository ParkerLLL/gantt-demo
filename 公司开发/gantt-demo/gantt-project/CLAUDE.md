# 甘特图管理系统开发文档

## 项目概述

### 基本信息
- **项目名称**: 甘特图管理系统 (Gantt Project Management System)
- **技术栈**: Vue3 + TypeScript + Vite + dhtmlx-gantt
- **开发模式**: 前后端分离
- **数据管理**: Pinia + REST API

### 功能特性
- 🎯 **双视图模式**: 版本迭代视图 / 需求任务视图
- 📊 **动态甘特图**: 基于dhtmlx-gantt的交互式甘特图
- 🔍 **多维度筛选**: 部门、项目、人员、时间范围等筛选
- ⏱️ **时间刻度切换**: 年/季度/月/周/日多种时间维度
- 📄 **详情查看**: 版本迭代、人员角色、工作项详情弹窗
- 📑 **分页支持**: 大数据量分页加载，性能优化
- 🔄 **展开控制**: 一键展开/收起所有节点

## 项目结构

```
gantt-project/
├── src/
│   ├── components/          # 公共组件
│   │   ├── gantt/          # 甘特图相关组件
│   │   │   ├── BasicGantt.vue        # 核心甘特图组件
│   │   │   └── TimeScaleController.vue # 时间刻度控制
│   │   ├── filter/         # 筛选相关组件
│   │   │   └── FilterPanel.vue       # 筛选面板
│   │   └── modal/          # 模态框组件
│   │       ├── IterationDetailModal.vue  # 版本迭代详情
│   │       ├── PersonRoleModal.vue       # 人员角色详情
│   │       ├── WorkItemDetailModal.vue   # 工作项详情
│   │       └── PersonCard.vue            # 人员信息卡片
│   ├── views/              # 页面组件
│   │   └── GanttPage.vue   # 甘特图主页面
│   ├── stores/             # 状态管理
│   │   ├── gantt.ts        # 甘特图数据状态
│   │   └── filter.ts       # 筛选状态
│   ├── types/              # 类型定义
│   │   ├── gantt.ts        # 甘特图相关类型
│   │   ├── api.ts          # API接口类型
│   │   └── index.ts        # 通用类型
│   ├── mock/               # 模拟数据
│   │   └── simple-data.ts  # 测试数据生成
│   └── utils/              # 工具函数
└── docs/                   # 项目文档
```

## 核心功能实现

### 1. 甘特图组件 (BasicGantt.vue)

#### 主要功能
- dhtmlx-gantt集成和配置
- 双视图数据转换 (版本迭代/需求任务)
- 时间刻度动态切换
- 详情按钮点击处理
- 展开/收起状态管理

#### 关键配置
```typescript
// 甘特图列配置
gantt.config.columns = [
  { name: 'text', label: '任务名称', tree: true, width: 180 },
  { name: 'start_date', label: '开始时间', align: 'center', width: 90 },
  { name: 'end_date', label: '结束时间', align: 'center', width: 90 },
  { name: 'action', label: '操作', align: 'center', width: 80, template: actionTemplate }
]

// 时间刻度配置示例
gantt.config.scales = [
  { unit: 'year', step: 1, format: '%Y年' },
  { unit: 'quarter', step: 1, format: function(date) {
    return 'Q' + (Math.floor(date.getMonth() / 3) + 1)
  }}
]
```

#### 事件处理
- `handleContainerClick`: 详情按钮点击处理
- `onTaskRowClick`: 树节点展开/收起
- `onTaskDblClick`: 双击事件处理

### 2. 状态管理 (Pinia)

#### GanttStore (`/src/stores/gantt.ts`)
```typescript
interface GanttState {
  config: GanttConfig           // 甘特图配置
  rawData: RawData             // 原始数据
  ganttTasks: GanttTask[]      // 甘特图任务数据
  filteredTasks: GanttTask[]   // 筛选后数据
  loading: boolean             // 加载状态
}
```

#### 核心方法
- `setViewType`: 切换视图类型
- `setTimeScale`: 切换时间刻度
- `setFilters`: 设置筛选条件
- `transformData`: 数据格式转换

#### FilterStore (`/src/stores/filter.ts`)
- 筛选条件管理
- 筛选选项动态更新
- 筛选状态持久化

### 3. 数据模型设计

#### 核心实体
```typescript
// 人员信息
interface Person {
  id: string
  name: string
  email: string
  department: string
  roles: PersonRole[]
}

// 版本迭代
interface Iteration {
  id: string
  name: string
  startDate: string
  endDate: string
  status: IterationStatus
  personId: string
  workItems?: WorkItem[]
}

// 工作项 (需求/任务)
interface WorkItem {
  id: string
  name: string
  startDate: string
  endDate: string
  workItemType: WorkItemType
  status: string
  personId: string
}
```

#### 甘特图数据格式
```typescript
interface GanttTask {
  id: string
  text: string
  start_date: string
  end_date: string
  duration: number
  progress: number
  parent: string
  type: 'project' | 'task'
  workItemType: WorkItemType
  personId: string
}
```

## API接口规范

### 分页甘特图数据获取
```http
GET /api/gantt/data
```

#### 请求参数
```typescript
interface GanttDataRequest {
  viewType: 'iteration' | 'requirement'
  page: number
  pageSize: number
  filters?: {
    department?: string
    project?: string
    spaceType?: 'project' | 'product' | 'team'
    iteration?: string
    personType?: PersonRole
    person?: string
    dateRange?: {
      startDate: string
      endDate: string
    }
  }
  expand?: {
    personIds?: string[]
    maxItemsPerPerson?: number
  }
}
```

#### 响应数据
```typescript
interface GanttDataResponse {
  persons: PersonGanttData[]
  pagination: {
    current: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalPersons: number
    totalWorkItems: number
    dataRange: {
      minDate: string
      maxDate: string
    }
  }
}
```

### 懒加载接口
```http
GET /api/gantt/person/{personId}/children
```

### 详情数据接口
```http
GET /api/gantt/iteration/{id}
GET /api/gantt/person/{id}
GET /api/gantt/work-item/{id}
```

### 筛选选项接口
```http
GET /api/gantt/filter-options
```

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 Vue3 Composition API 规范
- 组件采用 `<script setup>` 语法
- 样式使用 SCSS 预处理器

### 命名规范
- **组件**: PascalCase (如 `BasicGantt.vue`)
- **文件夹**: kebab-case (如 `gantt-project`)
- **变量/函数**: camelCase (如 `handleClick`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)

### Git 提交规范
```
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建配置等
```

### 开发工作流
1. **需求分析** → 技术方案设计
2. **数据模型** → 接口设计
3. **组件开发** → 功能实现
4. **集成测试** → 问题修复
5. **代码提交** → 文档更新

## 性能优化策略

### 大数据量处理
1. **服务端分页**: 按人员维度分页，每页20-50人
2. **懒加载**: 展开时才加载子项数据
3. **虚拟滚动**: 大量行时启用虚拟滚动
4. **数据缓存**: 缓存已访问页面的数据

### 渲染优化
1. **按需渲染**: 只渲染可视区域
2. **防抖处理**: 筛选和搜索操作防抖
3. **组件复用**: 列表项组件复用
4. **CSS优化**: 避免深层嵌套选择器

## 部署配置

### 开发环境
```bash
npm run dev
```

### 构建命令
```bash
npm run build
```

### 预览命令
```bash
npm run preview
```

### 类型检查
```bash
npm run typecheck
```

### 代码检查
```bash
npm run lint
```

## 浏览器兼容性
- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 依赖管理

### 主要依赖
- `vue`: ^3.4.0
- `vue-router`: ^4.2.0
- `pinia`: ^2.1.0
- `ant-design-vue`: ^4.0.0
- `dhtmlx-gantt`: ^8.0.0
- `dayjs`: ^1.11.0

### 开发依赖
- `typescript`: ^5.0.0
- `vite`: ^5.0.0
- `sass`: ^1.70.0
- `@types/node`: ^20.0.0

## 常见问题

### dhtmlx-gantt相关
1. **时间刻度显示问题**: 检查format函数实现
2. **数据更新不生效**: 调用`gantt.render()`刷新
3. **中文显示异常**: 配置正确的locale

### 性能问题
1. **大数据量卡顿**: 启用分页和虚拟滚动
2. **筛选响应慢**: 添加防抖处理
3. **内存占用高**: 及时清理不需要的数据

### 样式问题
1. **深度选择器**: 使用`:deep()`修改第三方组件样式
2. **响应式布局**: 使用媒体查询适配移动端
3. **主题定制**: 通过CSS变量统一管理主题色

## 后续规划

### Phase 1: 基础功能完善
- ✅ 甘特图基本展示
- ✅ 双视图切换
- ✅ 筛选功能
- ✅ 详情弹窗
- 🔄 分页功能 (进行中)

### Phase 2: 性能优化
- 🔄 服务端分页
- ⏳ 懒加载机制
- ⏳ 虚拟滚动
- ⏳ 智能缓存

### Phase 3: 高级功能
- ⏳ 甘特图编辑
- ⏳ 批量操作
- ⏳ 数据导出
- ⏳ 权限控制

### Phase 4: 移动端适配
- ⏳ 响应式优化
- ⏳ 触摸手势
- ⏳ 移动端专用组件

## 团队协作

### 开发团队角色
- **前端开发**: Vue3 + TypeScript 开发
- **后端开发**: REST API 设计和实现
- **产品经理**: 需求分析和用户体验
- **测试工程师**: 功能测试和性能测试

### 沟通机制
- **需求评审**: 产品需求澄清和技术方案讨论
- **代码评审**: Pull Request 代码审查
- **问题跟踪**: Issue 管理和Bug跟踪
- **定期同步**: 开发进度同步和风险识别

---

**文档版本**: 1.0  
**最后更新**: 2024-01-15  
**维护人员**: 前端开发团队