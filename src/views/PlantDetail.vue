<template>
    <div class="plant-detail-container">
        <el-card v-if="loading">
            <el-skeleton :rows="15" animated />
        </el-card>

        <div v-else-if="plant">
            <div class="plant-header">
                <div>
                    <el-button icon="ArrowLeft" @click="$router.go(-1)">返回</el-button>
                </div>
                <h1>{{ plant.name }}</h1>
                <p class="scientific-name">{{ plant.scientificName }}</p>
            </div>

            <el-tabs class="plant-tabs">
                <el-tab-pane label="基本信息">
                    <el-card>
                        <div class="info-section">
                            <h2>描述</h2>
                            <p>{{ plant.description }}</p>

                            <h2>时代</h2>
                            <p v-if="plant.era">
                                <el-tag>{{ plant.era }}</el-tag>
                            </p>
                            <p v-else>未知时代</p>

                            <h2>养护信息</h2>
                            <div class="care-info">
                                <div class="care-item">
                                    <div class="care-label">浇水需求</div>
                                    <div class="care-value">{{ plant.waterNeeds }}</div>
                                </div>
                                <div class="care-item">
                                    <div class="care-label">光照需求</div>
                                    <div class="care-value">{{ plant.lightNeeds }}</div>
                                </div>
                                <div class="care-item">
                                    <div class="care-label">土壤类型</div>
                                    <div class="care-value">{{ plant.soilType }}</div>
                                </div>
                                <div class="care-item">
                                    <div class="care-label">施肥需求</div>
                                    <div class="care-value">{{ plant.fertilizationNeeds }}</div>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-tab-pane>

                <el-tab-pane label="养护指南">
                    <el-card>
                        <div class="guide-section">
                            <div v-html="formattedCareGuide"></div>
                        </div>
                    </el-card>
                </el-tab-pane>

                <el-tab-pane label="生长阶段">
                    <el-card>
                        <div class="growth-section">
                            <div v-html="formattedGrowthStages"></div>
                        </div>
                    </el-card>
                </el-tab-pane>

                <el-tab-pane label="养护记录">
                    <el-card>
                        <div class="records-section">
                            <div class="records-header">
                                <h2>我的养护记录</h2>
                                <el-button type="primary" @click="showAddRecordDialog">添加记录</el-button>
                            </div>

                            <el-table :data="careRecords" style="width: 100%" v-if="careRecords.length > 0">
                                <el-table-column prop="timestamp" label="时间" :formatter="formatDate" />
                                <el-table-column prop="actionType" label="操作类型" />
                                <el-table-column prop="notes" label="备注" />
                                <el-table-column label="操作">
                                    <template #default="scope">
                                        <el-button type="text" @click="deleteRecord(scope.row.id)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>

                            <el-empty v-else description="暂无养护记录" />
                        </div>
                    </el-card>
                </el-tab-pane>
            </el-tabs>
        </div>

        <el-empty v-else description="未找到植物信息"></el-empty>

        <!-- 添加养护记录对话框 -->
        <el-dialog v-model="dialogVisible" title="添加养护记录" width="30%">
            <el-form :model="recordForm" label-width="100px">
                <el-form-item label="操作类型">
                    <el-select v-model="recordForm.actionType" placeholder="请选择操作类型">
                        <el-option label="浇水" value="浇水" />
                        <el-option label="施肥" value="施肥" />
                        <el-option label="修剪" value="修剪" />
                        <el-option label="翻土" value="翻土" />
                        <el-option label="病虫防治" value="病虫防治" />
                        <el-option label="其他" value="其他" />
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="recordForm.notes" type="textarea" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCareRecord">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPlantById } from '../api/plants';
import { getUserPlantCareRecords, addCareRecord as apiAddCareRecord, deleteCareRecord } from '../api/careRecords';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const plantId = route.params.id;
const plant = ref(null);
const loading = ref(true);
const careRecords = ref([]);
const dialogVisible = ref(false);

const recordForm = ref({
    actionType: '',
    notes: ''
});

// 格式化养护指南，将换行符转换为HTML
const formattedCareGuide = computed(() => {
    if (!plant.value || !plant.value.careGuide) return '';
    return plant.value.careGuide.replace(/\n/g, '<br>');
});

// 格式化生长阶段，假设是JSON存储的
const formattedGrowthStages = computed(() => {
    if (!plant.value || !plant.value.growthStages) return '';
    try {
        // 尝试解析JSON
        const stages = JSON.parse(plant.value.growthStages);
        let html = '';
        for (const key in stages) {
            html += `<h3>阶段${key}</h3><p>${stages[key]}</p>`;
        }
        return html;
    } catch (e) {
        // 如果不是JSON，直接返回文本
        return plant.value.growthStages.replace(/\n/g, '<br>');
    }
});

// 格式化日期
const formatDate = (row, column) => {
    if (!row.timestamp) return '';
    const date = new Date(row.timestamp);
    return date.toLocaleString('zh-CN');
};

// 获取植物详情
const loadPlantDetail = async () => {
    loading.value = true;
    try {
        const response = await getPlantById(plantId);
        plant.value = response.data;
    } catch (error) {
        console.error('获取植物详情失败:', error);
        ElMessage.error('获取植物详情失败');
    } finally {
        loading.value = false;
    }
};

// 获取养护记录
const loadCareRecords = async () => {
    try {
        const response = await getUserPlantCareRecords(plantId);
        careRecords.value = response.data;
    } catch (error) {
        console.error('获取养护记录失败:', error);
        ElMessage.error('获取养护记录失败');
    }
};

// 显示添加记录对话框
const showAddRecordDialog = () => {
    recordForm.value = {
        actionType: '',
        notes: ''
    };
    dialogVisible.value = true;
};

// 添加养护记录 - 重命名为submitCareRecord
const submitCareRecord = async () => {
    if (!recordForm.value.actionType) {
        ElMessage.warning('请选择操作类型');
        return;
    }

    try {
        await apiAddCareRecord({ // 使用重命名后的API函数
            plant: { id: plantId },
            actionType: recordForm.value.actionType,
            notes: recordForm.value.notes
        });
        ElMessage.success('记录添加成功');
        dialogVisible.value = false;
        await loadCareRecords();
    } catch (error) {
        console.error('添加记录失败:', error);
        ElMessage.error('添加记录失败');
    }
};

// 删除养护记录
const deleteRecord = async (recordId) => {
    try {
        await ElMessageBox.confirm('确定要删除这条记录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        await deleteCareRecord(recordId);
        ElMessage.success('记录删除成功');
        await loadCareRecords();
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除记录失败:', error);
            ElMessage.error('删除记录失败');
        }
    }
};

onMounted(() => {
    loadPlantDetail();
    loadCareRecords();
});
</script>

<style scoped>
.plant-detail-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.plant-header {
    text-align: center;
    margin-bottom: 20px;
}

.scientific-name {
    font-style: italic;
    color: #666;
    margin-top: 5px;
}

.info-section,
.guide-section,
.growth-section,
.records-section {
    padding: 10px;
}

.care-info {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin: 15px 0;
}

.care-item {
    min-width: 150px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.care-label {
    font-weight: bold;
    margin-bottom: 5px;
}

.period-tag {
    margin-left: 10px;
    color: #666;
}

.records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
</style>