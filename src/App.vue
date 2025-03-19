<script setup>
import { computed } from 'vue'
import { useUserStore } from './store/user'
import NavBar from './components/common/NavBar.vue'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
</script>

<template>
  <div class="app-container">
    <header v-if="isAuthenticated">
      <nav-bar />
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>&copy; {{ new Date().getFullYear() }} 时间旅行植物养成模拟器</p>
    </footer>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 20px;
}

footer {
  padding: 10px;
  text-align: center;
  background-color: #f8f9fa;
  margin-top: auto;
}
</style>
