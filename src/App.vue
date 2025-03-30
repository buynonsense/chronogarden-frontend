<script setup>
import { computed } from 'vue'
import { useUserStore } from './store/user'
import NavBar from './components/common/NavBar.vue'

const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
</script>

<template>
  <div>
    <header class="app-header">
      <nav-bar />
    </header>
    <main class="app-main">
      <div class="main-container">
        <router-view />
      </div>
    </main>
    <footer class="app-footer">
      <div class="footer-content">
        <p>
          &copy; {{ new Date().getFullYear() }} 时间旅行植物养成模拟器
          <span class="footer-emoji">🌱</span>
          <span class="footer-emoji">🕰️</span>
          <span class="footer-emoji">🌍</span>
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  width: 100%;
}

body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  /* 防止水平滚动 */
}

.app-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-main {
  background-color: var(--bg-light);
  padding: 20px 0;
  width: 100%;
  min-height: calc(100vh - 130px);
  /* 确保内容区域足够高 */
}

.main-container {
  max-width: 1600px;
  width: 90%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.app-footer {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  padding: 15px 0;
}

.footer-content {
  max-width: 1600px;
  width: 90%;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 增加移动端响应式调整 */
@media (max-width: 768px) {

  .main-container,
  .footer-content {
    width: 100%;
    padding: 0 15px;
  }

  .app-main {
    padding: 10px 0;
  }

  .footer-emoji {
    font-size: 0.9em;
  }
}
</style>
