<template>
    <div class="care-records-container">
        <h1>我的养护记录</h1>
        <p class="description">查看您对所有植物的养护历史记录</p>

        <el-card class="filter-card">
            <el-form :inline="true" :model="filters">
                <el-form-item label="植物">
                    <el-select v-model="filters.plantId" placeholder="选择植物" clearable @change="loadRecords" filterable
                        :loading="plantSearchLoading" @input="filterPlantOptions">
                        <el-option v-for="plant in displayPlants" :key="plant.id" :label="plant.name"
                            :value="plant.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="操作类型">
                    <el-select v-model="filters.actionType" placeholder="选择操作类型" clearable @change="filterRecords">
                        <el-option v-for="type in actionTypes" :key="type" :label="type" :value="type"></el-option>
                        <el-option label="正常衰减" value="正常衰减"></el-option>
                        <el-option label="随机衰减" value="随机衰减"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="loadRecords">查询</el-button>
                    <el-button @click="resetFilters">重置</el-button>
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
const displayPlants = ref([]);
const plantSearchLoading = ref(false);
const plantSearchQuery = ref('');
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
    plantSearchLoading.value = true;
    try {
        const response = await getPlants();
        plants.value = response.data;
        displayPlants.value = response.data; // 初始化显示全部植物
    } catch (error) {
        console.error('获取植物列表失败:', error);
        ElMessage.error('获取植物列表失败');
    } finally {
        plantSearchLoading.value = false;
    }
};

// 过滤植物选项
const filterPlantOptions = (query) => {
    if (query) {
        plantSearchQuery.value = query;
        displayPlants.value = plants.value.filter(plant =>
            plant.name.toLowerCase().includes(query.toLowerCase()));
    } else {
        displayPlants.value = plants.value;
    }
};

// 重置筛选
const resetFilters = () => {
    filters.value = {
        plantId: '',
        actionType: ''
    };
    displayPlants.value = plants.value;
    loadRecords();
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

// 添加实际操作类型的计算属性
const actionTypes = computed(() => {
    const types = new Set();
    careRecords.value.forEach(record => {
        if (record.actionType) {
            types.add(record.actionType);
        }
    });
    return Array.from(types);
});

// 获取操作类型的标签样式
const getActionTagType = (actionType) => {
    if (actionType.startsWith('随机事件-')) {
        return 'danger'; // 所有随机事件都用红色标签
    }

    switch (actionType) {
        case '浇水': return 'info';
        case '阳光': return 'warning';
        case '施肥': return 'success';
        case '修剪': return 'warning';
        case '领养植物': return 'primary';
        case '收获': return 'success';
        case '重新养护': return 'primary';
        case '正常衰减': return 'danger';
        default: return 'info';
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

/* 在 <style> 部分添加 */
.empty-text {
    padding: 8px 12px;
    text-align: center;
    color: #909399;
    font-size: 14px;
}

/* 确保下拉菜单有足够的宽度 */
:deep(.el-select) {
    width: 200px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
    .empty-text {
        color: #a0a0a0;
    }
}
</style>