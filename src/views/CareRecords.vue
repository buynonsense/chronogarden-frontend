<template>
    <div class="care-records-container">
        <h1>我的养护记录</h1>
        <p class="description">查看您对所有植物的养护历史记录</p>

        <el-card class="filter-card">
            <el-form :inline="true" :model="filters">
                <el-form-item label="植物">
                    <el-select v-model="filters.plantId" placeholder="选择植物" clearable @change="loadRecords">
                        <el-option v-for="plant in plants" :key="plant.id" :label="plant.name"
                            :value="plant.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="操作类型">
                    <el-select v-model="filters.actionType" placeholder="选择操作类型" clearable @change="filterRecords">
                        <el-option label="浇水" value="浇水"></el-option>
                        <el-option label="施肥" value="施肥"></el-option>
                        <el-option label="修剪" value="修剪"></el-option>
                        <el-option label="翻土" value="翻土"></el-option>
                        <el-option label="病虫防治" value="病虫防治"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="loadRecords">查询</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <div v-if="loading" class="loading">
            <el-skeleton :rows="10" animated />
        </div>

        <div v-else>
            <el-empty v-if="filteredRecords.length === 0" description="暂无养护记录"></el-empty>

            <el-card v-else class="records-card">
                <el-table :data="filteredRecords" style="width: 100%" border>
                    <el-table-column label="时间" prop="timestamp" :formatter="formatDate" sortable
                        width="180"></el-table-column>
                    <el-table-column label="植物" width="120">
                        <template #default="scope">
                            <span>{{ getPlantName(scope.row.plant.id) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作类型" prop="actionType" width="100"></el-table-column>
                    <el-table-column label="备注" prop="notes"></el-table-column>
                    <el-table-column label="操作" width="200">
                        <template #default="scope">
                            <el-button type="primary" size="small" @click="goToPlantDetail(scope.row.plant.id)">
                                查看植物
                            </el-button>
                            <el-button type="danger" size="small" @click="deleteRecord(scope.row.id)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- 数据统计和可视化 -->
            <el-card class="stats-card" v-if="careRecords.length > 0">
                <template #header>
                    <div class="card-header">
                        <h2>养护统计</h2>
                    </div>
                </template>
                <div class="stats-content">
                    <div class="stats-summary">
                        <div class="stat-item">
                            <div class="stat-value">{{ careRecords.length }}</div>
                            <div class="stat-label">总记录数</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ uniquePlants.length }}</div>
                            <div class="stat-label">养护植物</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ getMostFrequentAction().action }}</div>
                            <div class="stat-label">最常操作</div>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

import { getUserCareRecords, deleteCareRecord } from '../api/careRecords';
import { getPlants } from '../api/plants';

const router = useRouter();
const careRecords = ref([]);
const plants = ref([]);
const loading = ref(true);
const filters = ref({
    plantId: '',
    actionType: ''
});

// 根据过滤条件筛选记录
const filteredRecords = computed(() => {
    return careRecords.value.filter(record => {
        let matchPlant = true;
        let matchAction = true;

        if (filters.value.plantId) {
            matchPlant = record.plant && record.plant.id === filters.value.plantId;
        }

        if (filters.value.actionType) {
            matchAction = record.actionType === filters.value.actionType;
        }

        return matchPlant && matchAction;
    });
});

// 获取唯一植物列表
const uniquePlants = computed(() => {
    const plantIds = new Set();
    careRecords.value.forEach(record => {
        if (record.plant && record.plant.id) {
            plantIds.add(record.plant.id);
        }
    });
    return Array.from(plantIds);
});

// 格式化日期
const formatDate = (row, column) => {
    if (!row.timestamp) return '';
    const date = new Date(row.timestamp);
    return date.toLocaleString('zh-CN');
};

// 获取植物名称
const getPlantName = (plantId) => {
    const plant = plants.value.find(p => p.id === plantId);
    return plant ? plant.name : '未知植物';
};

// 获取最频繁的操作类型
const getMostFrequentAction = () => {
    const actionCount = {};
    careRecords.value.forEach(record => {
        if (record.actionType) {
            actionCount[record.actionType] = (actionCount[record.actionType] || 0) + 1;
        }
    });

    let maxAction = '';
    let maxCount = 0;

    for (const action in actionCount) {
        if (actionCount[action] > maxCount) {
            maxAction = action;
            maxCount = actionCount[action];
        }
    }

    return { action: maxAction || '无', count: maxCount };
};

// 加载养护记录
const loadRecords = async () => {
    loading.value = true;
    try {
        const response = await getUserCareRecords();
        careRecords.value = response.data;
    } catch (error) {
        console.error('获取养护记录失败:', error);
        ElMessage.error('获取养护记录失败');
    } finally {
        loading.value = false;
    }
};

// 加载植物列表
const loadPlants = async () => {
    try {
        const response = await getPlants();
        plants.value = response.data;
    } catch (error) {
        console.error('获取植物列表失败:', error);
    }
};

// 过滤记录
const filterRecords = () => {
    // 前端已经通过计算属性处理了过滤逻辑，这里可以留空
    // 或者添加额外逻辑，如重置分页等
};

// 跳转到植物详情
const goToPlantDetail = (plantId) => {
    router.push(`/plant/${plantId}`);
};

// 删除记录
const deleteRecord = async (recordId) => {
    try {
        await ElMessageBox.confirm('确定要删除这条记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        await deleteCareRecord(recordId);
        ElMessage.success('删除成功');
        loadRecords(); // 重新加载数据
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除记录失败:', error);
            ElMessage.error('删除记录失败');
        }
    }
};

onMounted(() => {
    loadRecords();
    loadPlants();
});
</script>

<style scoped>
.care-records-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.description {
    color: #666;
    margin-bottom: 20px;
}

.filter-card {
    margin-bottom: 20px;
}

.records-card {
    margin-bottom: 20px;
}

.loading {
    padding: 20px;
}

.stats-card {
    margin-top: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stats-summary {
    display: flex;
    justify-content: space-around;
    text-align: center;
}

.stat-item {
    padding: 15px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
}

.stat-label {
    margin-top: 5px;
    color: #666;
}
</style>