<template>
  <div class="test-component">
    <h2>测试组件</h2>
    <p>如果你能看到这个，说明Vue组件正常工作</p>
    <a-button type="primary" @click="showMessage">点击测试</a-button>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

const showMessage = () => {
  message.success('组件工作正常！')
}
</script>

<style scoped>
.test-component {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 20px;
}
</style>