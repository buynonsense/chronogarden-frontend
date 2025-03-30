<template>
    <div class="not-authorized-container">
        <el-result icon="warning" title="未授权访问" sub-title="您需要登录才能访问该页面">
            <template #extra>
                <el-button type="primary" @click="goToLogin">前往登录</el-button>
                <el-button @click="goToHome">返回首页</el-button>
            </template>
        </el-result>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const goToLogin = () => {
    router.push({
        path: '/login',
        query: { redirect: route.query.from || '/' }
    });
};

const goToHome = () => {
    router.push('/');
};
</script>

<style scoped>
.not-authorized-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 120px);
    padding: 20px;
}
</style>