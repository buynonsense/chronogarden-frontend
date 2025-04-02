<template>
    <div class="dashboard-container">
        <h1 class="welcome-title">欢迎回到您的时空花园 <span class="welcome-emoji">🌈</span></h1>

        <el-row :gutter="20">
            <el-col :span="16">
                <el-card class="dashboard-card garden-status-card">
                    <template #header>
                        <div class="card-header">
                            <h3><span class="header-emoji">🌿</span> 我的花园状态</h3>
                        </div>
                    </template>

                    <el-empty v-if="!hasPlants" description="您还没有种植任何植物">
                        <el-button type="primary" @click="$router.push('/plants')" class="action-button">
                            开始种植 <span class="btn-emoji">🌱</span>
                        </el-button>
                    </el-empty>

                    <div v-else class="garden-overview">
                        <div class="stat-box">
                            <div class="stat-icon">🌿</div>
                            <div class="stat-info">
                                <div class="stat-value">{{ plantCount }}</div>
                                <div class="stat-label">种植物</div>
                            </div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-icon">⏰</div>
                            <div class="stat-info">
                                <div class="stat-value">{{ lastCareTime }}</div>
                                <div class="stat-label">最近养护</div>
                            </div>
                        </div>

                        <el-button type="primary" @click="$router.push('/care-records')" class="view-records-btn">
                            查看养护记录 <span class="btn-emoji">📝</span>
                        </el-button>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card class="dashboard-card quick-links-card">
                    <template #header>
                        <div class="card-header">
                            <h3><span class="header-emoji">🚀</span> 快速导航</h3>
                        </div>
                    </template>
                    <div class="quick-links">
                        <el-button @click="$router.push('/eras')" class="nav-button">
                            <span class="btn-icon">🕰️</span> 探索时间节点
                        </el-button>
                        <el-button @click="$router.push('/plants')" class="nav-button">
                            <span class="btn-icon">🌱</span> 植物图鉴
                        </el-button>
                        <el-button @click="$router.push('/care-records')" class="nav-button">
                            <span class="btn-icon">📝</span> 养护记录
                        </el-button>
                        <el-button @click="$router.push('/my-garden')" class="nav-button">
                            <span class="btn-icon">🌿</span> 我的花园
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="dashboard-card plants-card" v-if="hasPlants">
            <template #header>
                <div class="card-header">
                    <h3><span class="header-emoji">⚠️</span> 需要关注的植物</h3>
                </div>
            </template>
            <el-table :data="plantsNeedingCare" v-if="plantsNeedingCare.length > 0" class="plants-table">
                <el-table-column prop="name" label="植物名称" width="180">
                    <template #default="scope">
                        <div class="plant-name-cell">
                            <span class="plant-emoji">🌱</span> {{ scope.row.name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                    <template #default="scope">
                        <el-tag type="warning" effect="light" class="status-tag">{{ scope.row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="lastCareDate" label="上次养护"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="viewPlant(scope.row.id)" class="view-btn">
                            查看 <span class="btn-emoji">👀</span>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-else description="暂无需要关注的植物" class="empty-plants"></el-empty>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getUserCareRecords } from '../api/careRecords';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const careRecords = ref([]);
const loading = ref(true);
const plantsNeedingCare = ref([]);

// 计算属性：是否有植物
const hasPlants = computed(() => {
    return plantCount.value > 0;
});

// 计算属性：植物数量
const plantCount = computed(() => {
    const uniquePlants = new Set();
    careRecords.value.forEach(record => {
        if (record.plant && record.plant.id) {
            uniquePlants.add(record.plant.id);
        }
    });
    return uniquePlants.size;
});

// 计算属性：最近养护时间
const lastCareTime = computed(() => {
    if (careRecords.value.length === 0) return '无养护记录';

    let latestDate = new Date(0);
    careRecords.value.forEach(record => {
        if (record.timestamp) {
            const recordDate = new Date(record.timestamp);
            if (recordDate > latestDate) {
                latestDate = recordDate;
            }
        }
    });

    return latestDate.getTime() === 0 ? '无养护记录' : latestDate.toLocaleString('zh-CN');
});

const viewPlant = (plantId) => {
    router.push(`/plant/${plantId}`);
};

const loadData = async () => {
    loading.value = true;
    try {
        // 获取养护记录
        const response = await getUserCareRecords();
        careRecords.value = response.data;

        // 获取需要关注的植物
        const plantsResponse = await axios.get('/api/plants/user/needing-care');
        plantsNeedingCare.value = plantsResponse.data.map(plant => ({
            ...plant,
            lastCareDate: plant.lastCareDate ?
                new Date(plant.lastCareDate).toLocaleDateString('zh-CN') :
                '从未养护'
        }));
    } catch (error) {
        console.error('获取数据失败:', error);
        ElMessage.error('获取数据失败');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
.dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.welcome-title {
    text-align: center;
    margin-bottom: 30px;
    color: var(--primary-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 2em;
}

.welcome-emoji {
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

.dashboard-card {
    margin-bottom: 25px;
    border-radius: var(--border-radius-large) !important;
    overflow: hidden;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
}

.dashboard-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(87, 188, 144, 0.15) !important;
}

.garden-status-card {
    height: 100%;
}

.quick-links-card {
    height: 100%;
}

.garden-overview {
    padding: 15px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.stat-box {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: rgba(87, 188, 144, 0.1);
    border-radius: var(--border-radius-medium);
    width: 80%;
}

.stat-icon {
    font-size: 2.5rem;
    line-height: 1;
}

.stat-info {
    text-align: left;
}

.stat-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--primary-dark);
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.quick-links {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px 0;
}

.nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--border-radius-medium) !important;
    transition: all 0.3s ease;
}

.btn-icon {
    font-size: 1.2em;
    transition: transform 0.3s ease;
}

.nav-button:hover .btn-icon {
    transform: scale(1.2);
}

.action-button {
    padding: 12px 25px;
    font-size: 1.1em;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-emoji {
    font-size: 1.3em;
}

.view-records-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
}

.plants-table {
    margin-top: 10px;
}

.plant-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.plant-emoji {
    font-size: 1.2em;
}

.status-tag {
    font-size: 0.9em;
    padding: 4px 8px;
    border-radius: 20px !important;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.view-btn {
    display: flex;
    align-items: center;
    gap: 5px;
}

.btn-emoji {
    transition: transform 0.3s ease;
}

.view-btn:hover .btn-emoji {
    transform: translateX(3px);
}

.empty-plants {
    padding: 20px 0;
}

.dashboard-section {
    margin-top: 30px;
}

.nav-card {
    border-radius: var(--border-radius-medium);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.nav-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2em;
    font-weight: bold;
}

.nav-content {
    text-align: center;
    padding: 15px;
}

.nav-content p {
    margin-bottom: 15px;
    color: var(--text-secondary);
}

@media (prefers-color-scheme: dark) {
    .dashboard-container {
        background-color: var(--bg-lightest);
    }

    .dashboard-card {
        background-color: var(--bg-card) !important;
        border-color: var(--el-border-color) !important;
    }

    /* 表格悬停样式优化 */
    :deep(.el-table tr:hover > td) {
        background-color: rgba(87, 188, 144, 0.1) !important;
        /* 使用主题色的暗色变体 */
    }

    /* 确保表格边框和背景颜色与夜间模式一致 */
    :deep(.el-table) {
        background-color: var(--bg-card) !important;
    }

    :deep(.el-table td),
    :deep(.el-table th) {
        background-color: var(--bg-card) !important;
        border-bottom-color: var(--el-border-color) !important;
    }

    :deep(.el-table--border) {
        border-color: var(--el-border-color) !important;
    }

    /* 表格头部样式 */
    :deep(.el-table__header-wrapper) {
        background-color: #252525 !important;
    }

    :deep(.el-table th) {
        background-color: #252525 !important;
    }

    /* 统计卡片夜间模式 */
    .stat-card {
        background-color: #2a2a2a !important;
        border-color: #3a3a3a !important;
    }

    .plant-name-cell,
    .status-tag {
        color: var(--text-primary) !important;
    }

    /* 空状态文本颜色 */
    :deep(.el-empty__description) {
        color: var(--text-secondary) !important;
    }
}
</style>
