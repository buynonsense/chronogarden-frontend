<template>
    <div class="navbar-container">
        <div class="navbar-content">
            <!-- 移动端汉堡菜单 -->
            <div class="mobile-nav-toggle" @click="toggleMobileMenu">
                <i class="el-icon-menu"></i>
                <span v-if="!mobileMenuOpen">☰</span>
                <span v-else>✕</span>
            </div>

            <!-- 桌面端菜单 -->
            <el-menu :default-active="activeIndex" mode="horizontal" router background-color="#57bc90" text-color="#fff"
                active-text-color="#fffde7" class="nav-menu desktop-menu">
                <el-menu-item index="/">首页 🏠</el-menu-item>
                <!-- <el-menu-item index="/eras">时间节点 🕰️</el-menu-item> -->
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

            <!-- 移动端菜单 -->
            <transition name="slide">
                <div class="mobile-menu" v-if="mobileMenuOpen">
                    <router-link to="/" class="mobile-menu-item" @click="closeMobileMenu">首页 🏠</router-link>
                    <!-- <router-link to="/eras" class="mobile-menu-item" @click="closeMobileMenu">时间节点 🕰️</router-link> -->
                    <router-link to="/plants" class="mobile-menu-item" @click="closeMobileMenu">植物图鉴 🌱</router-link>
                    <template v-if="isLoggedIn">
                        <router-link to="/dashboard" class="mobile-menu-item" @click="closeMobileMenu">个人仪表盘
                            📊</router-link>
                        <router-link to="/care-records" class="mobile-menu-item" @click="closeMobileMenu">养护记录
                            📝</router-link>
                        <a @click="handleLogout" class="mobile-menu-item">退出登录 👋</a>
                    </template>
                    <template v-else>
                        <router-link to="/login" class="mobile-menu-item" @click="closeMobileMenu">登录 🔑</router-link>
                        <router-link to="/register" class="mobile-menu-item" @click="closeMobileMenu">注册 ✨</router-link>
                    </template>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../store/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isAuthenticated);
const mobileMenuOpen = ref(false);

const activeIndex = computed(() => '/' + route.path.split('/')[1]);

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
};

const handleLogout = () => {
    userStore.logout();
    closeMobileMenu();
    router.push('/');
};

const logout = () => {
    userStore.logout();
    router.push('/');
};
</script>

<style scoped>
.navbar-container {
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: var(--primary-color);
}

.navbar-content {
    max-width: 1600px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    position: relative;
}

.nav-menu {
    display: flex;
    border-bottom: none !important;
    height: 60px;
    width: 100%;
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

/* 移动端汉堡菜单 */
.mobile-nav-toggle {
    display: none;
    position: absolute;
    right: 20px;
    top: 15px;
    font-size: 24px;
    color: white;
    cursor: pointer;
    z-index: 100;
}

/* 移动端菜单样式 */
.mobile-menu {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background-color: var(--primary-color);
    padding: 15px 0;
    z-index: 99;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

.mobile-menu-item {
    display: block;
    padding: 15px 20px;
    color: white;
    text-decoration: none;
    font-size: 18px;
    font-weight: 500;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.mobile-menu-item:hover,
.mobile-menu-item.router-link-active {
    background-color: var(--primary-dark);
}

.mobile-menu-item:last-child {
    border-bottom: none;
}

/* 移动端过渡动画 */
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

/* 媒体查询 */
@media (max-width: 768px) {
    .desktop-menu {
        display: none;
    }

    .mobile-nav-toggle {
        display: block;
    }

    .mobile-menu {
        display: block;
    }

    .navbar-content {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60px;
    }
}
</style>