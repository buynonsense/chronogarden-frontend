<template>
    <div class="home-container">
        <div class="hero-section">
            <h1>时间旅行植物养成模拟器</h1>
            <p class="subtitle">穿越时空，培育各个时代的神奇植物</p>
            <div class="cta-buttons">
                <el-button type="primary" size="large" @click="$router.push('/login')" v-if="!isAuthenticated">
                    开始旅程
                </el-button>
                <el-button type="success" size="large" @click="$router.push('/dashboard')" v-else>
                    进入花园
                </el-button>
            </div>
        </div>

        <div class="features-section">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-card class="feature-card">
                        <template #header>
                            <div class="card-header">
                                <h3>穿越时空</h3>
                            </div>
                        </template>
                        <p>探索不同历史时期的环境与植物，从远古时代到遥远的未来</p>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card class="feature-card">
                        <template #header>
                            <div class="card-header">
                                <h3>培育珍稀植物</h3>
                            </div>
                        </template>
                        <p>照料各个时代特有的植物种类，掌握不同时期的养护技巧</p>
                    </el-card>
                </el-col>
                <el-col :span="8">
                    <el-card class="feature-card">
                        <template #header>
                            <div class="card-header">
                                <h3>记录成长历程</h3>
                            </div>
                        </template>
                        <p>详细记录植物的成长过程，见证植物在你的照料下茁壮成长</p>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const isAuthenticated = computed(() => userStore.isAuthenticated);
</script>

<style scoped>
.home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.hero-section {
    text-align: center;
    padding: 60px 0;
    margin-bottom: 40px;
}

.subtitle {
    font-size: 1.2em;
    color: #666;
    margin-bottom: 30px;
}

.cta-buttons {
    margin-top: 30px;
}

.features-section {
    margin-bottom: 60px;
}

.feature-card {
    height: 100%;
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>