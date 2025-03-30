<template>
    <div class="eras-container">
        <h1 class="page-title">
            <span class="title-emoji">🕰️</span>
            时间旅行节点
            <span class="title-emoji">🌍</span>
        </h1>
        <p class="description">探索不同时代的环境特征和植物，穿越时空发现神奇植物的起源与进化</p>

        <el-row :gutter="30" v-if="loading">
            <el-col :span="24" class="loading-container">
                <el-skeleton :rows="5" animated />
            </el-col>
        </el-row>

        <el-row :gutter="30" v-else-if="eras.length > 0">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="era in eras" :key="era.id">
                <el-card class="era-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h2>{{ era.name }}</h2>
                            <el-tag v-if="era.period" effect="light">{{ era.period }}</el-tag>
                        </div>
                    </template>
                    <div class="card-content">
                        <p class="era-description">{{ era.description || '暂无描述' }}</p>
                        <div class="environment-info" v-if="era.climate || era.environmentalFactors">
                            <h3><span class="info-icon">🌤️</span> 环境信息</h3>
                            <p v-if="era.climate"><strong>气候：</strong>{{ era.climate }}</p>
                            <p v-if="era.environmentalFactors"><strong>环境因素：</strong>{{ era.environmentalFactors }}</p>
                        </div>
                        <div class="card-actions">
                            <el-button type="primary" @click="viewPlants(era.name)" class="view-plants-btn">
                                查看植物
                                <span class="btn-icon">🌱</span>
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-empty v-else description="暂无时代数据" class="empty-state">
            <el-button type="primary">重新加载</el-button>
        </el-empty>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getEras } from '../api/eras';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const eras = ref([]);
const loading = ref(true);

const loadEras = async () => {
    try {
        loading.value = true;
        console.log('开始获取时代数据');
        const response = await getEras();
        console.log('获取时代数据成功:', response.data);
        eras.value = response.data;
    } catch (error) {
        console.error('获取时代数据失败:', error);
        ElMessage.error('获取时代数据失败');
        eras.value = [];
    } finally {
        loading.value = false;
    }
};

const viewPlants = (eraName) => {
    router.push({
        path: '/plants',
        query: { era: eraName }
    });
};

onMounted(() => {
    loadEras();
});
</script>

<style scoped>
.eras-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    text-align: center;
    color: var(--primary-dark);
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 2.2em;
}

.title-emoji {
    display: inline-block;
    animation: pulse 2s infinite;
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

.description {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 35px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
    font-size: 1.1em;
}

.loading-container {
    margin-bottom: 30px;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: var(--border-radius-medium);
}

.era-card {
    height: 100%;
    margin-bottom: 30px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-radius: var(--border-radius-large) !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 250, 248, 0.95));
    overflow: hidden;
}

.era-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(87, 188, 144, 0.25) !important;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
}

.card-header h2 {
    margin: 0;
    color: var(--primary-color);
    font-size: 1.6em;
}

.era-description {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 20px;
}

.card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.environment-info {
    margin-top: 5px;
    padding: 15px;
    background-color: rgba(165, 214, 167, 0.15);
    border-radius: var(--border-radius-medium);
    margin-bottom: 20px;
}

.environment-info h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 5px;
}

.info-icon {
    display: inline-block;
    transition: transform 0.3s ease;
}

.era-card:hover .info-icon {
    transform: rotate(15deg);
}

.card-actions {
    margin-top: auto;
    padding-top: 15px;
}

.view-plants-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 1.05em;
    padding: 12px 20px;
    transition: all 0.3s ease;
}

.btn-icon {
    font-size: 1.1em;
    transition: transform 0.3s ease;
}

.era-card:hover .btn-icon {
    transform: translateY(-3px) scale(1.2);
}

.empty-state {
    margin-top: 50px;
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: var(--border-radius-large);
}
</style>