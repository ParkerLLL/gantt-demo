<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>当前时间: {{ currentTime }}</p>
    <a-button type="primary" @click="updateTime">更新时间</a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTime = ref(new Date().toLocaleString())

const updateTime = () => {
  currentTime.value = new Date().toLocaleString()
}
</script>

<style scoped>
.test-page {
  padding: 40px;
  text-align: center;
}
</style>