<template>
    <div class="garden-container">
        <h1 class="page-title">我的花园 <span class="title-emoji">🌿</span></h1>
        <p class="subtitle">在这里照料您领养的珍稀植物</p>

        <el-card v-if="loading" class="loading-card">
            <el-skeleton :rows="4" animated />
        </el-card>

        <div v-else-if="myPlants.length === 0" class="empty-state">
            <el-empty description="您的花园还没有植物">
                <el-button type="primary" @click="$router.push('/plants')">
                    前往植物图鉴领养植物
                </el-button>
            </el-empty>
        </div>

        <div v-else class="plants-grid">
            <PlantCard v-for="plant in myPlants" :key="plant.id" :plant="plant" :showCareActions="true" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import PlantCard from '../components/plant/PlantCard.vue';
import axios from 'axios';

const myPlants = ref([]);
const loading = ref(true);

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

.plants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    margin-top: 30px;
}

.empty-state {
    margin: 60px auto;
    text-align: center;
    max-width: 500px;
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
}
</style>