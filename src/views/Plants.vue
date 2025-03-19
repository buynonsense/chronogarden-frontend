<template>
    <div class="plants-container">
        <h1>植物图鉴</h1>
        <div class="filters">
            <el-select v-model="selectedTimeNode" placeholder="选择时间节点" clearable @change="loadPlants">
                <el-option v-for="node in timeNodes" :key="node.id" :label="node.name" :value="node.id"></el-option>
            </el-select>
        </div>

        <el-row :gutter="20" v-if="loading">
            <el-col :span="24">
                <el-skeleton :rows="10" animated />
            </el-col>
        </el-row>

        <el-row :gutter="20" v-else-if="plants.length > 0">
            <el-col :xs="24" :sm="12" :md="8" :xl="6" v-for="plant in plants" :key="plant.id" class="plant-item">
                <el-card class="plant-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h2>{{ plant.name }}</h2>
                            <p class="scientific-name">{{ plant.scientificName }}</p>
                        </div>
                    </template>
                    <div class="card-content">
                        <p class="description">{{ truncateText(plant.description, 100) }}</p>
                        <div class="plant-stats">
                            <div class="stat">
                                <div class="stat-label">浇水需求</div>
                                <div class="stat-value">{{ plant.waterNeeds }}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">光照需求</div>
                                <div class="stat-value">{{ plant.lightNeeds }}</div>
                            </div>
                            <div class="stat">
                                <div class="stat-label">土壤类型</div>
                                <div class="stat-value">{{ plant.soilType }}</div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <el-button type="primary" @click="viewDetail(plant.id)">查看详情</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-empty v-else description="暂无植物数据，请选择时间节点"></el-empty>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getPlants, getPlantsByTimeNode } from '../api/plants';
import { getTimeNodes } from '../api/timeNodes';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const plants = ref([]);
const timeNodes = ref([]);
const selectedTimeNode = ref(null);
const loading = ref(true);

// 截断文本函数
const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// 加载时间节点
const loadTimeNodes = async () => {
    try {
        const response = await getTimeNodes();
        timeNodes.value = response.data;
    } catch (error) {
        console.error('获取时间节点失败:', error);
        ElMessage.error('获取时间节点数据失败');
    }
};

// 加载植物数据
const loadPlants = async () => {
    loading.value = true;
    try {
        let response;
        if (selectedTimeNode.value) {
            response = await getPlantsByTimeNode(selectedTimeNode.value);
        } else {
            response = await getPlants();
        }
        plants.value = response.data;
    } catch (error) {
        console.error('获取植物数据失败:', error);
        ElMessage.error('获取植物数据失败');
    } finally {
        loading.value = false;
    }
};

// 查看植物详情
const viewDetail = (plantId) => {
    router.push(`/plant/${plantId}`);
};

onMounted(async () => {
    await loadTimeNodes();
    // 检查URL中是否有timeNodeId参数
    if (route.query.timeNodeId) {
        selectedTimeNode.value = parseInt(route.query.timeNodeId);
    }
    await loadPlants();
});
</script>

<style scoped>
.plants-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.filters {
    margin: 20px 0;
}

.plant-item {
    margin-bottom: 20px;
}

.plant-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-header {
    text-align: center;
}

.card-header h2 {
    margin: 0;
    font-size: 1.2rem;
}

.scientific-name {
    margin: 5px 0 0;
    font-style: italic;
    color: #888;
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.description {
    margin-bottom: 15px;
}

.plant-stats {
    display: flex;
    justify-content: space-around;
    margin: 15px 0;
    flex-wrap: wrap;
}

.stat {
    text-align: center;
    min-width: 80px;
    margin-bottom: 10px;
}

.stat-label {
    font-weight: bold;
    font-size: 0.9rem;
    color: #555;
}

.stat-value {
    margin-top: 5px;
    font-size: 0.9rem;
}

.card-actions {
    margin-top: auto;
    text-align: center;
}
</style>