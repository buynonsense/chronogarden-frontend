<template>
    <div class="navbar-container">
        <div class="navbar-content">
            <el-menu :default-active="activeIndex" mode="horizontal" router background-color="#57bc90" text-color="#fff"
                active-text-color="#fffde7" class="nav-menu">
                <el-menu-item index="/">首页 🏠</el-menu-item>
                <el-menu-item index="/eras">时间节点 🕰️</el-menu-item>
                <el-menu-item index="/plants">植物图鉴 🌱</el-menu-item>
                <div class="flex-spacer"></div>
                <template v-if="isLoggedIn">
                    <el-menu-item index="/dashboard">个人仪表盘 📊</el-menu-item>
                    <el-menu-item index="/care-records">养护记录 📝</el-menu-item>
                    <el-menu-item @click="logout">退出登录 👋</el-menu-item>
                </template>
                <template v-else>
                    <el-menu-item index="/login">登录 🔑</el-menu-item>
                    <el-menu-item index="/register">注册 ✨</el-menu-item>
                </template>
            </el-menu>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../store/user';

const route = useRoute();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isAuthenticated);

const activeIndex = computed(() => '/' + route.path.split('/')[1]); // 取第一级路径

const logout = () => {
    userStore.logout();
};
</script>

<style scoped>
.navbar-container {
    width: 100%;
    /* 不设置 max-width 保证全宽 */
}

.navbar-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
}

.nav-menu {
    display: flex;
    border-bottom: none !important;
    height: 60px;
}

.el-menu-item {
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    margin: 0 4px;
    transition: all 0.3s ease;
}

.el-menu-item:hover {
    background-color: var(--primary-dark) !important;
    transform: translateY(-2px);
}

.el-menu-item.is-active {
    background-color: var(--primary-dark) !important;
    font-weight: bold;
}

.flex-spacer {
    flex: 1;
}
</style>