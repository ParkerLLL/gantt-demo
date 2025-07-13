import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import router from './router'
import App from './App.vue'

// 样式引入
import 'ant-design-vue/dist/reset.css'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import '@/assets/styles/global.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
