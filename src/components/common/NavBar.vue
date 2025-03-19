<template>
    <el-menu mode="horizontal" router background-color="#545c64" text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="/dashboard">首页</el-menu-item>
        <el-menu-item index="/timenodes">时间节点</el-menu-item>
        <el-menu-item index="/plants">植物图鉴</el-menu-item>
        <el-menu-item index="/carerecords">我的养护记录</el-menu-item>

        <div class="flex-spacer"></div>

        <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
                {{ username }}
                <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()
const username = computed(() => userStore.username)

const handleCommand = (command) => {
    if (command === 'logout') {
        userStore.logout()
    }
}
</script>

<style scoped>
.flex-spacer {
    flex: 1;
}

.user-dropdown {
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 20px;
}

.el-menu {
    display: flex;
}
</style>