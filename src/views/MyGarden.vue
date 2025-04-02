<template>
    <div class="garden-container">
        <h1 class="page-title">我的花园 <span class="title-emoji">🌿</span></h1>
        <p class="subtitle">在这里照料您领养的珍稀植物</p>

        <el-card v-if="loading" class="loading-card">
            <el-skeleton :rows="4" animated />
        </el-card>

        <div v-else>
            <!-- 添加标签页组件 -->
            <el-tabs v-model="activeTab" class="garden-tabs">
                <el-tab-pane label="养护中" name="active">
                    <div v-if="activePlants.length === 0" class="empty-state">
                        <el-empty description="您没有正在养护的植物">
                            <el-button type="primary" @click="$router.push('/plants')">
                                前往植物图鉴领养植物
                            </el-button>
                        </el-empty>
                    </div>
                    <div v-else class="plants-grid">
                        <PlantCard v-for="plant in activePlants" :key="plant.id" :plant="plant"
                            :showCareActions="true" />
                    </div>
                </el-tab-pane>

                <el-tab-pane label="已完成" name="completed">
                    <div v-if="completedPlants.length === 0" class="empty-state">
                        <el-empty description="您还没有完成养护的植物">
                            <el-button type="primary" @click="activeTab = 'active'">
                                查看养护中的植物
                            </el-button>
                        </el-empty>
                    </div>
                    <div v-else class="plants-grid">
                        <PlantCard v-for="plant in completedPlants" :key="plant.id" :plant="plant"
                            :showCareActions="true" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import PlantCard from '../components/plant/PlantCard.vue';
import axios from 'axios';

const myPlants = ref([]);
const loading = ref(true);
const route = useRoute();
const activeTab = ref('active'); // 默认显示"养护中"标签

// 过滤植物为"养护中"和"已完成"两类
const activePlants = computed(() => {
    return myPlants.value.filter(plant => !plant.isCompleted);
});

const completedPlants = computed(() => {
    return myPlants.value.filter(plant => plant.isCompleted);
});

// 加载用户的植物
const loadUserPlants = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/plants/user/adopted');
        myPlants.value = response.data;
    } catch (error) {
        console.error('获取用户植物失败:', error);
        ElMessage.error('无法加载您的植物');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadUserPlants();
});

// 路由变化时刷新数据
watch(() => route.path, () => {
    if (route.path === '/my-garden') {
        loadUserPlants();
    }
});
</script>

<style scoped>
.garden-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-dark);
}

.title-emoji {
    animation: pulse 2s infinite;
}

.subtitle {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

.garden-tabs {
    margin-top: 20px;
}

.plants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    margin-top: 20px;
}

.empty-state {
    margin: 60px auto;
    text-align: center;
    max-width: 500px;
}

/* 自定义标签页样式 */
:deep(.el-tabs__item) {
    font-size: 16px;
    padding: 0 25px;
}

:deep(.el-tabs__item.is-active) {
    color: var(--primary-color);
    font-weight: bold;
}

:deep(.el-tabs__active-bar) {
    background-color: var(--primary-color);
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

@media (prefers-color-scheme: dark) {
    .garden-container {
        background-color: var(--bg-lightest);
    }

    :deep(.el-tabs__item) {
        color: var(--text-secondary);
    }

    :deep(.el-tabs__item.is-active) {
        color: var(--primary-light);
    }
}
</style>