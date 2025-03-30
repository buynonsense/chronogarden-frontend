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
/* 整体不设置 max-width 限制 */
body,
html {
  margin: 0;
  padding: 0;
}

/* 导航栏全宽，占据整个窗口 */
.app-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 主体内容采用居中且最大宽度限制 */
.app-main {
  background-color: var(--bg-light);
  padding: 20px 0;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页脚保持居中 */
.app-footer {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  padding: 15px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}
</style>
