<template>
    <div class="dashboard-container">
        <h1>欢迎回到您的时空花园</h1>

        <el-row :gutter="20">
            <el-col :span="16">
                <el-card class="dashboard-card">
                    <template #header>
                        <div class="card-header">
                            <h3>我的花园状态</h3>
                        </div>
                    </template>

                    <el-empty v-if="!hasPlants" description="您还没有种植任何植物">
                        <el-button type="primary" @click="$router.push('/plants')">开始种植</el-button>
                    </el-empty>

                    <div v-else class="garden-overview">
                        <p>您正在养护 {{ plantCount }} 种植物</p>
                        <p>最近一次养护时间: {{ lastCareTime }}</p>
                        <el-button type="primary" @click="$router.push('/carerecords')">查看养护记录</el-button>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card class="dashboard-card">
                    <template #header>
                        <div class="card-header">
                            <h3>快速导航</h3>
                        </div>
                    </template>
                    <div class="quick-links">
                        <el-button @click="$router.push('/timenodes')">探索时间节点</el-button>
                        <el-button @click="$router.push('/plants')">植物图鉴</el-button>
                        <el-button @click="$router.push('/carerecords')">养护记录</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-card class="dashboard-card" v-if="hasPlants">
            <template #header>
                <div class="card-header">
                    <h3>需要关注的植物</h3>
                </div>
            </template>
            <el-table :data="plantsNeedingCare" v-if="plantsNeedingCare.length > 0">
                <el-table-column prop="name" label="植物名称"></el-table-column>
                <el-table-column prop="status" label="状态"></el-table-column>
                <el-table-column prop="lastCareDate" label="上次养护"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="viewPlant(scope.row.id)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-else description="暂无需要关注的植物"></el-empty>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getUserCareRecords } from '../api/careRecords';
import { ElMessage } from 'element-plus';

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

        // 模拟计算需要关注的植物
        // 实际项目中应该有更复杂的逻辑来确定哪些植物需要关注
        const plantMap = new Map();
        careRecords.value.forEach(record => {
            if (record.plant && record.plant.id) {
                const plantId = record.plant.id;
                if (!plantMap.has(plantId)) {
                    plantMap.set(plantId, {
                        id: plantId,
                        name: record.plant.name || '未知植物',
                        lastCareDate: record.timestamp,
                        status: '需要关注'
                    });
                } else {
                    const existing = plantMap.get(plantId);
                    const recordDate = new Date(record.timestamp);
                    const existingDate = new Date(existing.lastCareDate);
                    if (recordDate > existingDate) {
                        existing.lastCareDate = record.timestamp;
                    }
                }
            }
        });

        // 将Map转换为数组并格式化日期
        plantsNeedingCare.value = Array.from(plantMap.values())
            .map(plant => ({
                ...plant,
                lastCareDate: new Date(plant.lastCareDate).toLocaleDateString('zh-CN')
            }))
            .slice(0, 5); // 只取前5个
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

.dashboard-card {
    margin-bottom: 20px;
}

.garden-overview {
    padding: 10px 0;
}

.quick-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h3 {
    margin: 0;
}
</style>
