<template>
    <div class="plant-detail-container">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="10" animated />
        </div>

        <div v-else-if="plant" class="plant-content">
            <div class="plant-header">
                <h1>{{ plant.name }} <span class="plant-emoji">🌱</span></h1>
                <p class="scientific-name">{{ plant.scientificName }}</p>
            </div>

            <!-- 植物交互区域 -->
            <div class="plant-interactive-area">
                <div class="plant-avatar-container">
                    <!-- 植物动态图像 -->
                    <div class="plant-avatar" :class="{ 'plant-growing': isGrowing }">
                        <!-- 根据植物类型显示不同的动画图片 -->
                        <img :src="getPlantAnimationSrc()" alt="植物动画" class="plant-image" />

                        <!-- 交互效果动画元素 -->
                        <div v-show="showWaterEffect" class="water-effect"></div>
                        <div v-show="showLightEffect" class="light-effect"></div> <!-- 新增光照效果 -->
                        <div v-show="showFertilizeEffect" class="fertilize-effect"></div>
                        <div v-show="showPruneEffect" class="prune-effect"></div>
                        <div v-show="showHarvestEffect" class="harvest-effect"></div>
                        <!-- <div v-show="showSoilEffect" class="soil-effect"></div> -->
                    </div>

                    <!-- 花盆/土壤区域 -->
                    <div class="plant-soil"></div>
                </div>

                <!-- 养护操作按钮环绕显示 -->
                <div class="care-actions-circle">
                    <button class="care-action-btn water-btn" @click="performCareAction('浇水')" :disabled="isOnCooldown">
                        <span class="action-icon">💧</span>
                        <span class="action-name">浇水</span>
                    </button>

                    <button class="care-action-btn light-btn" @click="performCareAction('阳光')" :disabled="isOnCooldown">
                        <span class="action-icon">☀️</span>
                        <span class="action-name">阳光</span>
                    </button>

                    <button class="care-action-btn fertilize-btn" @click="performCareAction('施肥')"
                        :disabled="isOnCooldown">
                        <span class="action-icon">🌱</span>
                        <span class="action-name">施肥</span>
                    </button>

                    <button class="care-action-btn prune-btn" @click="performCareAction('修剪')" :disabled="isOnCooldown">
                        <span class="action-icon">✂️</span>
                        <span class="action-name">修剪</span>
                    </button>

                    <!-- 添加收获按钮，仅在结果期显示 -->
                    <button v-if="plantStatus.growthStage === 'fruit' && !plantStatus.isWithered"
                        class="care-action-btn harvest-btn" @click="performCareAction('收获')" :disabled="isOnCooldown">
                        <span class="action-icon">🍎</span>
                        <span class="action-name">收获</span>
                    </button>
                </div>

                <!-- 操作反馈提示 -->
                <div v-if="actionFeedback" class="action-feedback" :class="actionFeedback.type">
                    {{ actionFeedback.message }}
                </div>

                <!-- 添加收获提示消息 -->
                <div v-if="plantStatus.growthStage === 'fruit' && !plantStatus.isWithered" class="harvest-alert">
                    果实已成熟，请及时收获！
                </div>
            </div>

            <!-- 植物生长状态区域 -->
            <div class="growth-status-area" v-if="plant && plantStatus">
                <el-card class="growth-status-card">
                    <template #header>
                        <div class="card-header">
                            <h3>
                                <span class="growth-icon" :class="getGrowthIconClass">{{ getGrowthEmoji }}</span>
                                生长状态
                            </h3>
                            <div class="status-tag-container">
                                <el-tag :type="getHealthStateTagType">{{ getHealthStateText }}</el-tag>
                                <el-tag v-if="plantStatus.isCompleted" type="success">已完成</el-tag>
                                <el-tag v-if="plantStatus.isWithered" type="danger">已枯萎</el-tag>
                            </div>
                        </div>
                    </template>

                    <!-- 生长进度区域 -->
                    <div class="growth-progress-section">
                        <h4>生长周期: {{ plantStatus.growthStage ? getGrowthStageText : '未开始' }}</h4>
                        <el-progress :percentage="getGrowthPercentage"
                            :format="() => `${plantStatus.growthDays}/${plantStatus.totalDays}天`"
                            :status="getGrowthProgressStatus" :stroke-width="20" class="growth-progress">
                        </el-progress>
                    </div>

                    <!-- 植物健康状态区域 -->
                    <div class="plant-health-section">
                        <div class="stat-item">
                            <div class="stat-header">
                                <span class="stat-icon">💧</span>
                                <span class="stat-name">水分</span>
                                <span class="stat-value">{{ plantStatus?.waterLevel || 0 }}%</span>
                            </div>
                            <div class="custom-progress-container">
                                <div class="custom-progress-bar"
                                    :style="{ width: `${plantStatus?.waterLevel || 0}%`, backgroundColor: '#409EFF' }">
                                </div>
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-header">
                                <span class="stat-icon">☀️</span>
                                <span class="stat-name">光照</span>
                                <span class="stat-value">{{ plantStatus?.lightLevel || 0 }}%</span>
                            </div>
                            <div class="custom-progress-container">
                                <div class="custom-progress-bar"
                                    :style="{ width: `${plantStatus?.lightLevel || 0}%`, backgroundColor: '#E6A23C' }">
                                </div>
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-header">
                                <span class="stat-icon">🌱</span>
                                <span class="stat-name">养分</span>
                                <span class="stat-value">{{ plantStatus?.nutrientLevel || 0 }}%</span>
                            </div>
                            <div class="custom-progress-container">
                                <div class="custom-progress-bar"
                                    :style="{ width: `${plantStatus?.nutrientLevel || 0}%`, backgroundColor: '#67C23A' }">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 生长控制按钮区域 -->
                    <div class="growth-control-section">
                        <!-- 开发模式: 手动衰减按钮 -->
                        <div v-if="isDevelopmentMode" class="development-controls">
                            <el-divider>开发工具</el-divider>
                            <div class="decay-buttons">
                                <el-button type="warning" size="small" @click="applyDecay('normal')">正常衰减</el-button>
                                <el-button type="danger" size="small" @click="applyDecay('drought')">干旱事件</el-button>
                                <el-button type="danger" size="small" @click="applyDecay('pest')">虫害事件</el-button>
                                <el-button type="danger" size="small" @click="applyDecay('coldwave')">寒潮事件</el-button>
                            </div>

                            <!-- 添加时间快进功能 -->
                            <el-divider>时间快进</el-divider>
                            <div class="time-buttons">
                                <el-button type="primary" size="small" @click="advanceTime(12)">增加12h</el-button>
                                <el-button type="primary" size="small" @click="advanceTime(24)">增加24h</el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 植物详细信息标签页 -->
            <el-tabs class="plant-tabs">
                <el-tab-pane label="基本信息">
                    <el-card class="info-card">
                        <div class="info-section">
                            <h3>物种描述</h3>
                            <p>{{ plant.description }}</p>
                        </div>

                        <div class="info-section">
                            <h3>历史背景</h3>
                            <div class="history-item">
                                <strong>首次出现: </strong>
                                <span>{{ plant.firstAppearance || '未知' }}</span>
                            </div>
                            <div class="history-item">
                                <strong>灭绝时间: </strong>
                                <span>{{ plant.extinctionTime || '仍然存在' }}</span>
                            </div>
                            <p>{{ plant.background || '暂无历史背景信息' }}</p>
                        </div>

                        <div class="info-section">
                            <h3>生长环境</h3>
                            <p>{{ plant.growthEnvironment || '暂无环境信息' }}</p>
                        </div>
                    </el-card>
                </el-tab-pane>

                <el-tab-pane label="养护指南">
                    <el-card class="guide-card">
                        <div class="guide-section">
                            <div v-html="formattedCareGuide"></div>
                        </div>
                    </el-card>
                </el-tab-pane>

                <el-tab-pane label="养护记录">
                    <el-card class="records-card">
                        <div class="care-records-header">
                            <h3>历史养护记录</h3>
                        </div>

                        <el-table v-if="careRecords.length > 0" :data="careRecords" class="records-table">
                            <el-table-column prop="createdTime" label="时间" width="180">
                                <template #default="scope">
                                    {{ formatDate(scope.row.createdTime) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="actionType" label="操作类型" width="120">
                                <template #default="scope">
                                    <el-tag :type="getActionTagType(scope.row.actionType)">
                                        {{ scope.row.actionType }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="notes" label="备注" />
                            <el-table-column label="操作" width="120">
                                <template #default="scope">
                                    <el-button type="danger" size="small" @click="handleDeleteRecord(scope.row.id)"
                                        :disabled="!canDeleteRecord(scope.row.createdTime)">
                                        删除
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <el-empty v-else description="暂无养护记录" />
                    </el-card>
                </el-tab-pane>
            </el-tabs>
        </div>

        <el-empty v-else description="未找到植物信息" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { getPlantById } from '../api/plants';
import { getUserPlantCareRecords, addCareRecord as apiAddCareRecord, deleteCareRecord } from '../api/careRecords';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const plantId = route.params.id;
const plant = ref(null);
const loading = ref(true);
const careRecords = ref([]);
const isGrowing = ref(false);
const showWaterEffect = ref(false);
const showLightEffect = ref(false); // 新增光照效果状态
const showFertilizeEffect = ref(false);
const showPruneEffect = ref(false);
const showHarvestEffect = ref(false);
// const showSoilEffect = ref(false);
const actionFeedback = ref(null);
const plantStatus = ref({
    waterLevel: 0,
    lightLevel: 0,
    nutrientLevel: 0,
    healthStatus: 0,
    growthDays: 0,
    totalDays: 14,
    growthStage: "",
    isWithered: false,
    isCompleted: false
});
const statusPollingInterval = ref(null);
const isDevelopmentMode = ref(process.env.NODE_ENV === 'development');
const isOnCooldown = ref(false);

// 格式化养护指南，将换行符转换为HTML
const formattedCareGuide = computed(() => {
    if (!plant.value || !plant.value.careGuide) return '';
    return plant.value.careGuide.replace(/\n/g, '<br>');
});

// 根据植物类型获取动画图片
const getPlantAnimationSrc = () => {
    if (!plant.value || !plantStatus.value) {
        return '/images/plants/default-plant.gif';
    }

    const type = plant.value.type || 'default';
    const stage = plantStatus.value.growthStage || 'seed';
    const status = plantStatus.value.healthStatus || 50;

    let statePrefix = '';
    if (status === 0) {
        statePrefix = 'withered_';
    } else if (status <= 30) {
        statePrefix = 'endangered_';
    } else if (status <= 79) {
        statePrefix = '';
    } else {
        statePrefix = 'healthy_';
    }

    return `/images/plants/${statePrefix}${type}_${stage}.gif`;
};

// 执行养护操作
const performCareAction = async (actionType) => {
    // 如果在冷却中，直接返回
    if (isOnCooldown.value) return;

    // 设置冷却状态
    isOnCooldown.value = true;

    // 显示加载提示
    const loading = ElLoading.service({
        lock: true,
        text: `${actionType}中...`,
        background: 'rgba(0, 0, 0, 0.6)'
    });

    // 显示相应的动画效果
    showActionEffect(actionType);

    // 延时3秒模拟操作过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        // 调用API记录养护操作
        await apiAddCareRecord({
            plant: { id: plantId },
            actionType: actionType,
            notes: '' // 简单操作不需要备注
        });

        // 特殊处理收获操作
        if (actionType === '收获') {
            const response = await axios.post(`/api/plants/${plantId}/harvest`);
            if (response.data.isCompleted) {
                // 使用ElementPlus的全页面通知代替普通反馈
                ElMessageBox.alert(
                    '您已成功培育并收获了这株珍稀植物！这是一项了不起的成就！',
                    '植物培育完成！',
                    {
                        confirmButtonText: '前往我的花园',
                        type: 'success',
                        center: true,
                        dangerouslyUseHTMLString: true,
                        customClass: 'clear-message-box',
                    }
                ).then(() => {
                    // 点击确认按钮后导航到我的花园
                    router.push('/my-garden');
                }).catch(() => {
                    // 即使用户关闭弹窗也导航到我的花园
                    router.push('/my-garden');
                });
            }
        } else {
            // 其他养护操作的逻辑...
        }

        // 添加养护记录和刷新操作
        await loadCareRecords();
        await loadPlantGrowthStatus();

        ElMessage.success(`${actionType}成功！`);
    } catch (error) {
        console.error('养护操作失败:', error);

        // 显示错误反馈
        actionFeedback.value = {
            type: 'error',
            message: `${actionType}失败，请稍后再试。`
        };
    } finally {
        // 关闭加载提示
        loading.close();

        // 冷却结束后重置状态
        isOnCooldown.value = false;
    }

    // 3秒后清除反馈信息
    setTimeout(() => {
        actionFeedback.value = null;
    }, 3000);
};

// 显示操作效果动画
const showActionEffect = (actionType) => {
    switch (actionType) {
        case '浇水':
            showWaterEffect.value = true;
            setTimeout(() => { showWaterEffect.value = false; }, 2000);
            break;
        case '阳光': // 新增光照效果逻辑
            showLightEffect.value = true;
            setTimeout(() => { showLightEffect.value = false; }, 2000);
            break;
        case '施肥':
            showFertilizeEffect.value = true;
            setTimeout(() => { showFertilizeEffect.value = false; }, 2000);
            break;
        case '修剪':
            showPruneEffect.value = true;
            setTimeout(() => { showPruneEffect.value = false; }, 2000);
            break;
        case '收获':
            showHarvestEffect.value = true;
            setTimeout(() => { showHarvestEffect.value = false; }, 2000);
            break;
        // case '翻土':
        //     showSoilEffect.value = true;
        //     setTimeout(() => { showSoilEffect.value = false; }, 2000);
        //     break;
    }
};

// 触发植物生长动画
const triggerGrowthAnimation = () => {
    isGrowing.value = true;
    setTimeout(() => { isGrowing.value = false; }, 3000);
};

// 根据操作类型获取标签类型
const getActionTagType = (actionType) => {
    const typeMap = {
        '浇水': 'primary',
        '阳光': 'info', // 新增光照标签类型
        '施肥': 'success',
        '修剪': 'warning',
        '收获': 'success'
        // '翻土': 'info',
        // '病虫防治': 'danger'
    };
    return typeMap[actionType] || 'info'; // 将 'default' 改为 'info'
};

// 判断是否可以删除记录（只能删除24小时内的记录）
const canDeleteRecord = (createdTime) => {
    const recordTime = new Date(createdTime).getTime();
    const now = new Date().getTime();
    return (now - recordTime) < 24 * 60 * 60 * 1000;
};

// 加载植物信息
const loadPlantDetails = async () => {
    try {
        const response = await getPlantById(plantId);
        plant.value = response.data;
    } catch (error) {
        console.error('加载植物详情失败:', error);
        ElMessage.error('加载植物详情失败');
    } finally {
        loading.value = false;
    }
};

// 加载养护记录
const loadCareRecords = async () => {
    try {
        const response = await getUserPlantCareRecords(plantId);
        careRecords.value = response.data;
    } catch (error) {
        console.error('加载养护记录失败:', error);
    }
};

// 删除养护记录
const handleDeleteRecord = async (recordId) => {
    try {
        await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        await deleteCareRecord(recordId);
        ElMessage.success('删除成功');
        await loadCareRecords();
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除记录失败:', error);
            ElMessage.error('删除记录失败');
        }
    }
};

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 加载植物生长状态
const loadPlantGrowthStatus = async () => {
    try {
        console.log('正在加载植物状态...');
        const response = await axios.get(`/api/plants/${plantId}/growth-status`);
        console.log('后端返回的数据:', response.data);

        // 确保所有需要的字段都存在
        plantStatus.value = {
            waterLevel: Number(response.data.waterLevel || 0),
            lightLevel: Number(response.data.lightLevel || 0),
            nutrientLevel: Number(response.data.nutrientLevel || 0),
            healthStatus: Number(response.data.healthStatus || 0),
            growthDays: Number(response.data.growthDays || 0),
            totalDays: Number(response.data.totalDays || 14),
            growthStage: response.data.growthStage || "",
            healthState: response.data.healthState || "healthy",
            isWithered: Boolean(response.data.isWithered),
            isCompleted: Boolean(response.data.isCompleted)
        };

        console.log('处理后的植物状态:', plantStatus.value);
    } catch (error) {
        console.error('加载植物生长状态失败:', error);
    }
};

// 执行手动衰减（仅开发模式）
const applyDecay = async (decayType) => {
    if (!isDevelopmentMode.value) return;

    // 如果在冷却中，直接返回
    if (isOnCooldown.value) return;

    // 设置冷却状态
    isOnCooldown.value = true;

    // 显示加载提示
    const loading = ElLoading.service({
        lock: true,
        text: `应用${getDecayTypeText(decayType)}中...`,
        background: 'rgba(0, 0, 0, 0.6)'
    });

    try {
        await axios.post(`/api/plants/${plantId}/apply-decay?decayType=${decayType}`);
        ElMessage.success(`已应用${getDecayTypeText(decayType)}！`);
        await loadPlantGrowthStatus();
    } catch (error) {
        console.error('执行衰减失败:', error);
        ElMessage.error('执行衰减失败，请稍后再试');
    } finally {
        // 关闭加载提示
        loading.close();

        // 冷却结束后重置状态
        isOnCooldown.value = false;
    }
};

// 时间快进（仅开发模式）
const advanceTime = async (hours) => {
    if (!isDevelopmentMode.value) return;

    // 如果在冷却中，直接返回
    if (isOnCooldown.value) return;

    // 设置冷却状态
    isOnCooldown.value = true;

    // 显示加载提示
    const loading = ElLoading.service({
        lock: true,
        text: `时间快进${hours}小时中...`,
        background: 'rgba(0, 0, 0, 0.6)'
    });

    try {
        await axios.post(`/api/plants/${plantId}/advance-time?hours=${hours}`);
        ElMessage.success(`成功快进 ${hours} 小时！`);
        await loadPlantGrowthStatus();
        await loadCareRecords();
    } catch (error) {
        console.error('时间快进失败:', error);
        ElMessage.error('时间快进失败，请稍后再试');
    } finally {
        // 关闭加载提示
        loading.close();

        // 冷却结束后重置状态
        isOnCooldown.value = false;
    }
};


// 获取衰减类型文本
const getDecayTypeText = (decayType) => {
    switch (decayType) {
        case 'normal': return '正常衰减';
        case 'drought': return '干旱事件';
        case 'pest': return '虫害事件';
        case 'coldwave': return '寒潮事件';
        default: return '未知衰减类型';
    }
};

// 更新植物动画状态
const updatePlantAnimation = () => {
    if (!plantStatus.value) return;

    // 根据健康状态更新植物显示
    const status = plantStatus.value.healthStatus;

    if (status === 0) {
        // 枯萎状态
        isGrowing.value = false;
        // 可以添加枯萎特效
    } else if (status <= 30) {
        // 濒危状态
        isGrowing.value = false;
        // 可以添加濒危特效
    } else {
        // 正常或健康状态
        isGrowing.value = true;
    }
};

// 计算属性：健康状态文本
const getHealthStateText = computed(() => {
    if (!plantStatus.value) return '';

    const status = plantStatus.value.healthStatus;
    if (status === 0) return '枯萎';
    if (status <= 30) return '濒危';
    if (status <= 79) return '正常';
    return '健康';
});

// 计算属性：健康状态标签类型
const getHealthStateTagType = computed(() => {
    if (!plantStatus.value) return '';

    const status = plantStatus.value.healthStatus;
    if (status === 0) return 'danger';
    if (status <= 30) return 'warning';
    if (status <= 79) return 'info';
    return 'success';
});

// 计算属性：生长阶段文本
const getGrowthStageText = computed(() => {
    if (!plantStatus.value) return '';

    const stage = plantStatus.value.growthStage;
    if (stage === 'seed') return '种子期 (0-2天)';
    if (stage === 'sprout') return '发芽期 (2-5天)';
    if (stage === 'flower') return '开花期 (5-10天)';
    if (stage === 'fruit') return '结果期 (10-14天)';
    return '未知阶段';
});

// 计算属性：生长阶段图标
const getGrowthEmoji = computed(() => {
    if (!plantStatus.value) return '🌱';

    const stage = plantStatus.value.growthStage;
    if (stage === 'seed') return '🌰';
    if (stage === 'sprout') return '🌱';
    if (stage === 'flower') return '🌸';
    if (stage === 'fruit') return '🍎';
    return '🌱';
});

// 计算属性：生长图标类
const getGrowthIconClass = computed(() => {
    if (!plantStatus.value) return '';

    if (plantStatus.value.isWithered) return 'withered';

    return plantStatus.value.growthStage;
});

// 计算属性：生长进度百分比
const getGrowthPercentage = computed(() => {
    if (!plantStatus.value) return 0;

    const days = plantStatus.value.growthDays;
    const total = plantStatus.value.totalDays;

    return Math.min(100, Math.round((days / total) * 100));
});

// 计算属性：生长进度状态
const getGrowthProgressStatus = computed(() => {
    if (!plantStatus.value) return '';

    if (plantStatus.value.isWithered) return 'exception';
    if (plantStatus.value.isCompleted) return 'success';
    if (plantStatus.value.healthStatus <= 30) return 'warning';

    return '';
});

// 计算属性：是否处于活跃生长状态
const isActiveGrowth = computed(() => {
    if (!plantStatus.value) return false;

    return !plantStatus.value.isWithered &&
        plantStatus.value.growthDays > 0 &&
        !plantStatus.value.isCompleted;
});

// 获取植物特定属性进度条的状态
const getStatProgressStatus = (value) => {
    if (value === undefined || value === null) return '';
    if (value === 0) return 'exception';
    if (value <= 30) return 'warning';
    return 'normal';
};

// 获取植物特定属性进度条的颜色
const getStatProgressColor = (value) => {
    if (value === undefined || value === null) return '';
    if (value === 0) return '#F56C6C';
    if (value <= 30) return '#E6A23C';
    if (value <= 79) return '#409EFF';
    return '#67C23A';
};

// 设置状态轮询
const setupStatusPolling = () => {
    // 每1分钟刷新一次植物状态
    statusPollingInterval.value = setInterval(loadPlantGrowthStatus, 60000);
};

onMounted(() => {
    loadPlantDetails();
    loadCareRecords();
    loadPlantGrowthStatus();
    setupStatusPolling();
});

onUnmounted(() => {
    // 清除轮询定时器
    if (statusPollingInterval.value) {
        clearInterval(statusPollingInterval.value);
    }
});
</script>

<style scoped>
.plant-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.loading-container {
    padding: 20px;
    background: #fff;
    border-radius: var(--border-radius-large);
    box-shadow: var(--shadow-light);
}

.plant-header {
    text-align: center;
    margin-bottom: 20px;
}

.plant-header h1 {
    color: var(--primary-dark);
    font-size: 2.2em;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.scientific-name {
    font-style: italic;
    color: var(--text-light);
    font-size: 1.1em;
}

/* 植物交互区域 */
.plant-interactive-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 30px 0;
    position: relative;
    min-height: 400px;
}

.plant-avatar-container {
    position: relative;
    width: 300px;
    height: 300px;
}

.plant-avatar {
    position: relative;
    width: 100%;
    height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.5s ease;
}

.plant-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: all 0.5s ease;
}

.plant-growing .plant-image {
    transform: scale(1.05);
    filter: brightness(1.1) saturate(1.2);
}

.plant-soil {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 40px;
    background: linear-gradient(to bottom, #8B4513, #654321);
    border-radius: 50% 50% 10px 10px;
    z-index: -1;
}

/* 养护操作按钮 */
.care-actions-circle {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 20px;
}

.care-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #fff;
    border: 2px solid var(--primary-color);
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.care-action-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.care-action-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.action-icon {
    font-size: 1.8em;
    margin-bottom: 5px;
}

.action-name {
    font-size: 0.9em;
    font-weight: 500;
}

/* 特定操作按钮样式 */
.water-btn {
    background-color: #e3f2fd;
    border-color: #2196f3;
}

.fertilize-btn {
    background-color: #e8f5e9;
    border-color: #4caf50;
}

.prune-btn {
    background-color: #fff3e0;
    border-color: #ff9800;
}

.harvest-btn {
    background-color: #fff8e1;
    border-color: #ffc107;
}

/* 阳光按钮样式 */
.light-btn {
    background-color: #fff8e1;
    border-color: #ffb300;
}

/* 翻土和病虫防治按钮样式 */
/* .soil-btn {
    background-color: #f5f5f5;
    border-color: #795548;
}

.pest-btn {
    background-color: #fce4ec;
    border-color: #e91e63;
} */

/* 操作效果动画 */

/* 浇水效果动画 */
.water-effect {
    position: absolute;
    top: 10%;
    left: 0;
    width: 100%;
    height: 80%;
    z-index: 2;
    pointer-events: none;
    animation: waterDrops 2s ease-in-out;
}

.water-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(30, 144, 255, 0.5) 0%, rgba(30, 144, 255, 0) 100%);
    animation: waterFlow 2s ease-in-out;
}

/* 光照效果样式 - 让它与PlantCard.vue中的一致 */
.light-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
}

.light-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(255, 235, 59, 0.7) 0%, rgba(255, 235, 59, 0) 70%);
    animation: sunlight 3s ease-in-out;
}

.light-effect::after {
    content: '☀️';
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 24px;
    animation: sunRotate 2s ease-in-out;
}

@keyframes sunRotate {
    0% {
        opacity: 0;
        transform: scale(0.5) rotate(0deg);
    }

    30% {
        opacity: 1;
        transform: scale(1.2) rotate(180deg);
    }

    70% {
        opacity: 1;
        transform: scale(1) rotate(360deg);
    }

    100% {
        opacity: 0;
        transform: scale(0.5) rotate(540deg);
    }
}

/* 施肥效果动画 */
.fertilize-effect {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    z-index: 2;
    pointer-events: none;
    animation: fertilizeGrow 2s ease-in-out;
}

.fertilize-effect::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 20px;
    background-color: rgba(76, 175, 80, 0.4);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    animation: fertilizerSpread 2s ease-in-out;
}

/* 修剪效果动画 */
.prune-effect {
    position: absolute;
    top: 20%;
    left: 0;
    width: 100%;
    height: 60%;
    z-index: 2;
    pointer-events: none;
    overflow: visible;
}

.prune-effect::before,
.prune-effect::after {
    content: '✂️';
    position: absolute;
    font-size: 24px;
    animation: pruneSnip 2s ease-in-out;
}

.prune-effect::before {
    top: 30%;
    left: 20%;
    animation-delay: 0.3s;
}

.prune-effect::after {
    top: 50%;
    right: 20%;
    animation-delay: 0.8s;
}

/* 收获效果动画 */
.harvest-effect {
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    height: 60%;
    z-index: 2;
    pointer-events: none;
}

.harvest-effect::before {
    content: '🍎';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 40px;
    animation: harvestPop 2s ease-in-out;
}

/* 动画定义 */
@keyframes waterDrops {
    0% {
        opacity: 0;
    }

    30% {
        opacity: 1;
    }

    70% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

@keyframes waterFlow {
    0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.8);
    }

    30% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    70% {
        opacity: 0.8;
    }

    100% {
        opacity: 0;
        transform: translateY(20px) scale(1.1);
    }
}

@keyframes fertilizeGrow {
    0% {
        opacity: 0;
    }

    30% {
        opacity: 1;
    }

    70% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

@keyframes fertilizerSpread {
    0% {
        transform: scaleX(0.2);
        opacity: 0;
    }

    40% {
        transform: scaleX(1);
        opacity: 1;
    }

    100% {
        transform: scaleX(1.1);
        opacity: 0;
    }
}

@keyframes pruneSnip {
    0% {
        transform: scale(0.5) rotate(-30deg);
        opacity: 0;
    }

    20% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }

    40% {
        transform: scale(1) rotate(15deg);
    }

    60% {
        transform: scale(1) rotate(0deg);
    }

    80% {
        transform: scale(1) rotate(-15deg);
    }

    100% {
        transform: scale(0.5) rotate(0deg);
        opacity: 0;
    }
}

@keyframes harvestPop {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }

    20% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
    }

    40% {
        transform: translate(-50%, -50%) scale(1);
    }

    60% {
        transform: translate(-50%, -50%) scale(1.1);
    }

    80% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }

    100% {
        transform: translate(-50%, -150%) scale(0.8);
        opacity: 0;
    }
}

/* 操作反馈提示 */
.action-feedback {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 500;
    animation: fadeInOut 3s ease-in-out;
    z-index: 10;
    white-space: nowrap;
}

.action-feedback.success {
    background-color: rgba(76, 175, 80, 0.2);
    border: 1px solid #4caf50;
    color: #2e7d32;
}

.action-feedback.error {
    background-color: rgba(244, 67, 54, 0.2);
    border: 1px solid #f44336;
    color: #c62828;
}

.harvest-alert {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffd54f;
    color: #7d5700;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: 500;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    animation: pulse 2s infinite;
}

@keyframes fadeInOut {
    0% {
        opacity: 0;
        transform: translate(-50%, 10px);
    }

    15% {
        opacity: 1;
        transform: translate(-50%, 0);
    }

    85% {
        opacity: 1;
        transform: translate(-50%, 0);
    }

    100% {
        opacity: 0;
        transform: translate(-50%, -10px);
    }
}

/* 信息标签页 */
.plant-tabs {
    margin-top: 30px;
    border-radius: var(--border-radius-medium);
    overflow: hidden;
}

.info-card,
.guide-card,
.records-card {
    border-radius: var(--border-radius-medium) !important;
    box-shadow: var(--shadow-light) !important;
}

.info-section {
    margin-bottom: 20px;
}

.info-section h3 {
    color: var(--primary-color);
    margin-bottom: 10px;
    font-size: 1.2em;
}

.history-item {
    margin-bottom: 8px;
}

.guide-section {
    line-height: 1.8;
}

.care-records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.care-records-header h3 {
    margin: 0;
    color: var(--primary-dark);
}

.records-table {
    margin-top: 15px;
}

/* 响应式样式 */
@media (max-width: 768px) {
    .plant-interactive-area {
        min-height: 300px;
    }

    .plant-avatar-container {
        width: 200px;
        height: 200px;
    }

    .care-action-btn {
        width: 70px;
        height: 70px;
    }

    .action-icon {
        font-size: 1.5em;
    }

    .action-name {
        font-size: 0.8em;
    }
}

/* 新增样式 */
.growth-status-area {
    margin: 20px 0;
}

.growth-status-card {
    border-radius: var(--border-radius-medium);
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

.growth-icon {
    font-size: 1.5em;
    transition: all 0.3s ease;
}

.growth-icon.withered {
    filter: grayscale(1) opacity(0.7);
}

.growth-icon.seed {
    animation: pulseGently 2s infinite alternate;
}

.growth-icon.sprout {
    animation: growSprout 3s infinite alternate;
}

.growth-icon.flower {
    animation: bloomFlower 4s infinite alternate;
}

.growth-icon.fruit {
    animation: ripeFruit 3s infinite alternate;
}

.status-tag-container {
    display: flex;
    gap: 8px;
}

.growth-progress-section {
    margin: 15px 0;
}

.growth-progress-section h4 {
    margin-bottom: 8px;
    color: var(--text-secondary);
}

.growth-progress {
    margin-bottom: 20px;
}

.plant-health-section {
    margin: 20px 0;
}

.stat-item {
    margin-bottom: 15px;
}

.stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.stat-icon {
    font-size: 18px;
    margin-right: 10px;
}

.stat-name {
    font-weight: bold;
    margin-right: auto;
}

.stat-value {
    color: var(--text-secondary);
}

.custom-progress-container {
    width: 100%;
    height: 10px;
    background-color: #e9e9e9;
    border-radius: 5px;
    overflow: hidden;
}

.custom-progress-bar {
    height: 100%;
    border-radius: 5px;
    transition: width 0.3s ease;
}

.growth-control-section {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.development-controls {
    margin-top: 10px;
}

.decay-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.time-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

@media (prefers-color-scheme: dark) {
    .time-buttons .el-button--primary {
        background-color: rgba(64, 158, 255, 0.2) !important;
        border-color: #409EFF !important;
        color: #e0e0e0 !important;
    }
}

@keyframes pulseGently {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(1.1);
    }
}

@keyframes growSprout {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-5px);
    }
}

@keyframes bloomFlower {
    0% {
        transform: rotate(-5deg);
    }

    100% {
        transform: rotate(5deg);
    }
}

@keyframes ripeFruit {
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

/* 黑暗模式下按钮样式调整 */
@media (prefers-color-scheme: dark) {

    /* 养护操作按钮文字颜色 */
    .care-action-btn {
        background-color: #333333 !important;
        border-color: #444444 !important;
    }

    .care-action-btn .action-name {
        color: #e0e0e0 !important;
        /* 确保文字在深色背景上可读 */
    }

    /* 特定操作按钮的样式调整 */
    .water-btn {
        background-color: rgba(33, 150, 243, 0.2) !important;
        border-color: #2196f3 !important;
    }

    .fertilize-btn {
        background-color: rgba(76, 175, 80, 0.2) !important;
        border-color: #4caf50 !important;
    }

    .prune-btn {
        background-color: rgba(255, 152, 0, 0.2) !important;
        border-color: #ff9800 !important;
    }

    .harvest-btn {
        background-color: rgba(255, 193, 7, 0.2) !important;
        border-color: #ffc107 !important;
    }

    .light-btn {
        background-color: rgba(255, 179, 0, 0.2) !important;
        border-color: #ffb300 !important;
    }

    .harvest-alert {
        background-color: rgba(255, 193, 7, 0.7);
        color: #fff;
    }

    /* 悬停效果增强 */
    .care-action-btn:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3) !important;
    }

    /* 确保操作图标在深色背景下可见 */
    .action-icon {
        filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
    }

    .custom-progress-container {
        background-color: #333;
    }

    .stat-value {
        color: #bbb;
    }
}

/* Clear成就消息框样式 */
:deep(.clear-message-box) {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    border: 2px solid gold;
}

:deep(.clear-message-box .el-message-box__header) {
    background-color: #4CAF50;
    color: white;
    padding: 15px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

:deep(.clear-message-box .el-message-box__title) {
    color: white;
    font-size: 22px;
    text-align: center;
}

:deep(.clear-message-box .el-message-box__content) {
    padding: 30px 20px;
    font-size: 18px;
    text-align: center;
}

:deep(.clear-message-box .el-message-box__btns) {
    justify-content: center;
}

:deep(.clear-message-box .el-button--primary) {
    background-color: #4CAF50;
    border-color: #4CAF50;
    padding: 12px 24px;
    font-size: 16px;
}

@media (prefers-color-scheme: dark) {
    :deep(.clear-message-box) {
        background-color: #333;
        border: 2px solid gold;
    }

    :deep(.clear-message-box .el-message-box__content) {
        color: #eee;
    }
}
</style>