<template>
    <el-card class="plant-card" :class="{ 'completed-card': !showCareActions && plant.isCompleted }"
        :body-style="{ padding: '0' }">
        <!-- 添加覆盖层，仅在植物图鉴模式且植物已完成时显示 -->
        <div v-if="!showCareActions && plant.isCompleted" class="completed-overlay">
            <div class="completed-badge">
                <span class="completed-text">CLEAR</span>
                <span class="completed-icon">🏆</span>
            </div>
        </div>

        <div class="plant-visual-container">
            <!-- 植物状态展示区 -->
            <div class="plant-visual" :class="plantStateClass">
                <img :src="getPlantImage()" class="plant-image" alt="植物图片" />

                <!-- 状态指示器 - 仅在我的花园中显示 -->
                <div class="plant-status-indicators" v-if="showCareActions && interactive">
                    <div class="status-indicator water-indicator" v-if="waterLevel < 30">💧</div>
                    <div class="status-indicator light-indicator" v-if="lightLevel < 30">☀️</div>
                    <div class="status-indicator nutrient-indicator" v-if="nutrientLevel < 30">🌱</div>
                    <div class="status-indicator withered-indicator" v-if="isWithered">💀</div>
                </div>

                <!-- 生长阶段指示器 - 仅在我的花园中显示 -->
                <div class="growth-stage-indicator" v-if="showCareActions && growthStage && !isWithered">
                    {{ getGrowthStageEmoji() }}
                </div>

                <!-- 养护操作动画效果 -->
                <div v-if="showAnimation" :class="['care-animation', animationClass]"></div>
            </div>

            <!-- 养护操作按钮区域 - 仅在我的花园中显示 -->
            <div class="care-actions" v-if="showCareActions">
                <!-- 当植物枯萎时显示重新养护按钮 -->
                <div v-if="isWithered" class="withered-actions">
                    <button class="care-button restart-button" @click="restartGrowth" :disabled="isOnCooldown">
                        <span class="button-icon">🔄</span>
                        <span class="button-text">重新养护</span>
                    </button>
                </div>

                <!-- 原有养护操作按钮，在非枯萎状态显示 -->
                <template v-else>
                    <button class="care-button water-button" @click="performCare('浇水')"
                        :disabled="isWithered || isOnCooldown || isCompleted">
                        <span class="button-icon">💧</span>
                        <span class="button-text">浇水</span>
                    </button>

                    <button class="care-button light-button" @click="performCare('阳光')"
                        :disabled="isWithered || isOnCooldown || isCompleted">
                        <span class="button-icon">☀️</span>
                        <span class="button-text">阳光</span>
                    </button>

                    <button class="care-button fertilize-button" @click="performCare('施肥')"
                        :disabled="isWithered || isOnCooldown || isCompleted">
                        <span class="button-icon">🌱</span>
                        <span class="button-text">施肥</span>
                    </button>

                    <button class="care-button prune-button" @click="performCare('修剪')"
                        :disabled="isWithered || isOnCooldown || isCompleted">
                        <span class="button-icon">✂️</span>
                        <span class="button-text">修剪</span>
                    </button>

                    <!-- 添加收获按钮 -->
                    <button v-if="growthStage === 'fruit' && !isWithered" class="care-button harvest-button"
                        @click="performCare('收获')" :disabled="isOnCooldown || isCompleted">
                        <span class="button-icon">🍎</span>
                        <span class="button-text">收获</span>
                    </button>
                </template>
            </div>

            <!-- 修改收获提示显示条件 -->
            <div v-if="showCareActions && growthStage === 'fruit' && !isWithered && !isCompleted"
                class="harvest-reminder" :class="{ 'fade-out': isHarvestReminderFading }">
                <span class="reminder-icon">⏰</span>
                <span class="reminder-text">果实成熟，请及时收获!</span>
            </div>
        </div>

        <!-- 植物信息 -->
        <div class="plant-info">
            <div class="plant-header">
                <h3>{{ plant.name }}</h3>
                <div class="tags-container">
                    <el-tag size="small" v-if="plant.era">{{ plant.era }}</el-tag>
                    <el-tag size="small" type="success" effect="plain" v-if="showCareActions && plant.isCompleted"
                        class="clear-tag">
                        <span class="clear-text">CLEAR</span>
                        <span class="clear-icon">🏆</span>
                    </el-tag>
                </div>
            </div>

            <p class="scientific-name">{{ plant.scientificName }}</p>

            <!-- 添加这个部分，用于显示植物描述 -->
            <p class="plant-description" v-if="!showCareActions && plant.description">
                {{ truncateDescription(plant.description) }}
            </p>

            <!-- 生长周期进度条 - 仅在我的花园中显示 -->
            <div class="growth-progress" v-if="showCareActions && growthDays > 0">
                <div class="progress-label">
                    <span>生长周期: {{ getGrowthStageText() }}</span>
                    <span>{{ growthDays }}/14天</span>
                </div>
                <el-progress :percentage="Math.min(100, Math.round((growthDays / 14) * 100))"
                    :status="growthProgressStatus">
                </el-progress>
            </div>

            <!-- 植物状态指标 - 仅在我的花园中显示 -->
            <div class="plant-status" v-if="showCareActions && !isWithered">
                <div class="status-label">
                    <span>状态: </span>
                    <el-tag size="small" :type="healthStateType">{{ healthStateText }}</el-tag>
                </div>
                <div class="progress-row">
                    <el-progress :percentage="Number(waterLevel) || 0" color="#409EFF"
                        :status="getStatProgressStatus(Number(waterLevel) || 0)" class="plant-progress">
                        <template #default>
                            <span class="progress-text">水分</span>
                        </template>
                    </el-progress>
                </div>

                <div class="progress-row">
                    <el-progress :percentage="Number(lightLevel) || 0" color="#E6A23C"
                        :status="getStatProgressStatus(Number(lightLevel) || 0)" class="plant-progress">
                        <template #default>
                            <span class="progress-text">光照</span>
                        </template>
                    </el-progress>
                </div>

                <div class="progress-row">
                    <el-progress :percentage="Number(nutrientLevel) || 0" color="#67C23A"
                        :status="getStatProgressStatus(Number(nutrientLevel) || 0)" class="plant-progress">
                        <template #default>
                            <span class="progress-text">养分</span>
                        </template>
                    </el-progress>
                </div>
            </div>

            <!-- 按钮区域 -->
            <div class="plant-actions">
                <!-- 植物图鉴模式下的操作按钮 -->
                <div v-if="!showCareActions" class="catalog-actions">
                    <!-- 未领养状态显示领养按钮 -->
                    <el-button v-if="!isAdopted" type="primary" @click="adoptPlant" class="adopt-button"
                        :disabled="isOnCooldown">
                        领养植物
                    </el-button>

                    <!-- 已领养未完成状态显示养护中按钮 -->
                    <el-button v-else-if="isUserPlant" type="success" @click="goToMyGarden" class="maintaining-button">
                        养护中
                    </el-button>

                    <!-- 已完成状态不显示按钮 -->
                    <div v-else-if="plant.isCompleted" class="completed-status">
                        已完成
                    </div>
                </div>

                <!-- 查看详情按钮根据不同场景有不同行为 -->
                <el-popover v-if="!showCareActions" placement="top" :width="300" trigger="click">
                    <template #reference>
                        <el-button type="default" class="details-button">
                            详情介绍
                        </el-button>
                    </template>
                    <template #default>
                        <h4>{{ plant.name }}</h4>
                        <p class="popup-scientific-name">{{ plant.scientificName }}</p>
                        <div class="popup-description">
                            {{ plant.description || '暂无详细描述' }}
                        </div>
                        <div class="popup-era" v-if="plant.era">
                            <strong>时代:</strong> {{ plant.era }}
                        </div>
                    </template>
                </el-popover>

                <!-- 我的花园模式下，仍然跳转到详情页 -->
                <el-button v-else type="default" @click="viewDetails" class="details-button">
                    查看详情
                </el-button>
            </div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { addCareRecord } from '../../api/careRecords';
import { ElMessage, ElLoading } from 'element-plus';
import axios from 'axios';

const props = defineProps({
    plant: {
        type: Object,
        required: true
    },
    interactive: {
        type: Boolean,
        default: true
    },
    // 新增：控制是否显示养护操作
    showCareActions: {
        type: Boolean,
        default: false
    }
});

const router = useRouter();

// 植物状态变量
const waterLevel = ref(props.plant.waterLevel || 70);
const lightLevel = ref(props.plant.lightLevel || 70);
const nutrientLevel = ref(props.plant.nutrientLevel || 70);
const growthStage = ref(props.plant.growthStage || 'seed');
const growthDays = ref(0);
const isWithered = ref(props.plant.isWithered || false);
const growthStarted = ref(!!props.plant.growthStartTime);
const showAnimation = ref(false);
const animationClass = ref('');
const isCompleted = ref(false);
const isOnCooldown = ref(false); // 冷却状态变量
const isHarvestReminderFading = ref(false); // 新增：收获提示淡出状态

// 判断用户是否已领养此植物
const isAdopted = ref(false);
const isUserPlant = ref(false);

// 修改加载植物生长状态的函数
const loadPlantGrowthStatus = async () => {
    if (!props.plant.id) return;

    try {
        const response = await axios.get(`/api/plants/${props.plant.id}/growth-status`);
        const data = response.data;

        // 确保值是有效的数字，并且在0-100范围内
        waterLevel.value = Math.min(100, Math.max(0, Number(data.waterLevel || 70)));
        lightLevel.value = Math.min(100, Math.max(0, Number(data.lightLevel || 70)));
        nutrientLevel.value = Math.min(100, Math.max(0, Number(data.nutrientLevel || 70)));

        growthStage.value = data.growthStage || 'seed';
        growthDays.value = Number(data.growthDays || 0);
        isWithered.value = Boolean(data.isWithered);
        growthStarted.value = Number(data.growthDays || 0) > 0;
        isCompleted.value = Boolean(data.isCompleted);

        console.log('加载的植物状态:', {
            waterLevel: waterLevel.value,
            lightLevel: lightLevel.value,
            nutrientLevel: nutrientLevel.value
        });
    } catch (error) {
        console.error('获取植物生长状态失败:', error);
    }
};

// 检查植物是否已被当前用户领养
const checkPlantAdoptionStatus = async () => {
    try {
        const response = await axios.get('/api/plants/user/adopted');
        const userPlants = response.data;

        // 检查当前植物是否在用户已领养的植物列表中
        isAdopted.value = userPlants.some(p => p.id === props.plant.id);

        // 检查是当前用户的植物
        isUserPlant.value = isAdopted.value && !props.plant.isCompleted;

        console.log(`植物 ${props.plant.id} 领养状态: ${isAdopted.value}, 完成状态: ${props.plant.isCompleted}`);
    } catch (error) {
        console.error('检查植物领养状态失败:', error);
    }
};

// 计算植物整体健康状态
const healthStatus = computed(() => {
    if (isWithered.value) return 0;

    // 计算平均值
    const avg = Math.floor((waterLevel.value + lightLevel.value + nutrientLevel.value) / 3);
    return avg;
});

// 健康状态文本
const healthStateText = computed(() => {
    const status = healthStatus.value;
    if (status === 0) return '枯萎';
    if (status <= 30) return '濒危';
    if (status <= 79) return '正常';
    return '健康';
});

// 健康状态标签类型
const healthStateType = computed(() => {
    const status = healthStatus.value;
    if (status === 0) return 'danger';
    if (status <= 30) return 'warning';
    if (status <= 79) return '';
    return 'success';
});

// 植物视觉状态类
const plantStateClass = computed(() => {
    const classes = [];

    if (isWithered.value) {
        classes.push('withered');
    } else {
        if (waterLevel.value <= 30) classes.push('needs-water');
        if (lightLevel.value <= 30) classes.push('needs-light');
        if (nutrientLevel.value <= 30) classes.push('needs-nutrient');

        // 添加生长阶段类
        if (growthStage.value) {
            classes.push(`stage-${growthStage.value}`);
        }

        // 添加健康状态类
        if (healthStatus.value <= 30) {
            classes.push('endangered');
        } else if (healthStatus.value >= 80) {
            classes.push('healthy');
        }
    }

    return classes;
});

// 生长进度状态
const growthProgressStatus = computed(() => {
    if (isWithered.value) return 'exception';
    if (props.plant.isCompleted) return 'success';
    if (healthStatus.value <= 30) return 'warning';
    return '';
});

// 获取植物生长阶段文本
const getGrowthStageText = () => {
    switch (growthStage.value) {
        case 'seed': return '种子期';
        case 'sprout': return '发芽期';
        case 'flower': return '开花期';
        case 'fruit': return '结果期';
        default: return '未知阶段';
    }
};

// 获取生长阶段对应的emoji
const getGrowthStageEmoji = () => {
    switch (growthStage.value) {
        case 'seed': return '🌰';
        case 'sprout': return '🌱';
        case 'flower': return '🌸';
        case 'fruit': return '🍎';
        default: return '🌱';
    }
};

// 修改获取状态进度条状态的方法
const getStatProgressStatus = (value) => {
    if (value === 0) return 'exception';
    if (value <= 30) return 'warning';
    return '';  // 返回空字符串而不是 'normal'
};

// 获取植物图片
const getPlantImage = () => {
    // 在植物图鉴模式下统一使用 default_seed.png
    if (!props.showCareActions) {
        return `/images/plants/default_seed.png`;
    }

    // 我的花园模式下使用动态图片
    const type = props.plant.type || 'default';
    let statePrefix = '';

    if (isWithered.value) {
        statePrefix = 'withered_';
    } else if (healthStatus.value <= 30) {
        statePrefix = 'endangered_';
    } else if (healthStatus.value >= 80) {
        statePrefix = 'healthy_';
    }

    const stageSuffix = growthStage.value || 'seed';
    return `/images/plants/${statePrefix}${type}_${stageSuffix}.png`;
};

// 执行养护操作
const performCare = async (actionType) => {
    if (isWithered.value || isOnCooldown.value || isCompleted.value) return;

    // 设置冷却状态
    isOnCooldown.value = true;

    // 显示加载提示
    const loading = ElLoading.service({
        lock: true,
        text: `${actionType}中...`,
        background: 'rgba(0, 0, 0, 0.6)'
    });

    // 显示动画效果
    showAnimation.value = true;

    // 延时3秒模拟操作过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        // 根据操作类型设置不同动画并更新植物状态
        switch (actionType) {
            case '浇水':
                animationClass.value = 'water-animation';
                // 先调用后端API
                await axios.post(`/api/plants/${props.plant.id}/water`);
                // 只在前端临时更新，保持视觉反馈一致性
                waterLevel.value = Math.min(100, waterLevel.value + 30); // 与后端一致的值
                break;

            case '阳光':
                animationClass.value = 'light-animation';
                // 先尝试直接调用后端接口
                await axios.post(`/api/plants/${props.plant.id}/light`);
                // 只在前端临时更新，保持视觉反馈
                lightLevel.value = Math.min(100, lightLevel.value + 30); // 与后端一致的值
                break;

            case '施肥':
                animationClass.value = 'fertilize-animation';
                // 先调用后端API
                await axios.post(`/api/plants/${props.plant.id}/fertilize`);
                // 前端临时更新
                nutrientLevel.value = Math.min(100, nutrientLevel.value + 30); // 与后端一致的值
                break;

            // 修剪操作处理
            case '修剪':
                animationClass.value = 'prune-animation';
                // 先调用后端API
                await axios.post(`/api/plants/${props.plant.id}/prune`);
                // 前端临时更新状态值
                waterLevel.value = Math.min(100, waterLevel.value + 10);
                lightLevel.value = Math.min(100, lightLevel.value + 15);
                nutrientLevel.value = Math.min(100, nutrientLevel.value + 20);// 与后端一致的值
                break;

            case '收获':
                animationClass.value = 'harvest-animation';
                // 收获不需要更新水分等属性，因为这是完成操作
                const response = await axios.post(`/api/plants/${props.plant.id}/harvest`);
                if (response.data.isCompleted) {
                    // 添加淡出动画
                    isHarvestReminderFading.value = true;
                    ElMessage.success('恭喜！您已成功收获并完成了这株植物的培育！');
                    // 更新植物状态
                    isCompleted.value = true;
                }
                break;
        }

        // 添加延时，让动画有时间显示
        setTimeout(() => {
            showAnimation.value = false;
        }, 2000);

        // 调用API记录养护操作
        await addCareRecord({
            plant: { id: props.plant.id },
            actionType: actionType,
            notes: `执行了${actionType}操作`
        });

        // 重新加载植物状态
        await loadPlantGrowthStatus();

        ElMessage.success(`${actionType}成功！`);
    } catch (error) {
        console.error(`${actionType}失败:`, error);
        ElMessage.error(`${actionType}失败，请稍后再试`);
    } finally {
        // 关闭加载提示
        loading.close();

        // 冷却结束后重置状态
        isOnCooldown.value = false;
    }
};

// 新增：重新养护植物方法
const restartGrowth = async () => {
    if (isOnCooldown.value) return;

    // 设置冷却状态
    isOnCooldown.value = true;

    // 显示加载提示
    const loading = ElLoading.service({
        lock: true,
        text: '重新养护中...',
        background: 'rgba(0, 0, 0, 0.6)'
    });

    // 延时3秒模拟操作过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        // 调用重新养护接口
        await axios.post(`/api/plants/${props.plant.id}/start-growth`);

        // 添加养护记录
        await addCareRecord({
            plant: { id: props.plant.id },
            actionType: '重新养护',
            notes: '重新开始植物生长周期'
        });

        // 更新状态
        isWithered.value = false;

        // 重新加载植物状态
        await loadPlantGrowthStatus();

        ElMessage.success('植物已重新开始养护！');
    } catch (error) {
        console.error('重新养护失败:', error);
        ElMessage.error('重新养护失败，请稍后再试');
    } finally {
        // 关闭加载提示
        loading.close();

        // 冷却结束后重置状态
        isOnCooldown.value = false;
    }
};

// 新增：领养植物方法
const adoptPlant = async () => {
    if (isOnCooldown.value) return;

    // 设置冷却状态
    isOnCooldown.value = true;

    // 显示加载提示
    const loading = ElLoading.service({
        lock: true,
        text: '领养植物中...',
        background: 'rgba(0, 0, 0, 0.6)'
    });

    // 延时3秒模拟操作过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        await axios.post(`/api/plants/${props.plant.id}/adopt`);

        // 记录养护记录
        await addCareRecord({
            plant: { id: props.plant.id },
            actionType: '领养植物',
            notes: '开始植物生长周期'
        });

        // 立即更新状态，不需要等待页面刷新
        isAdopted.value = true;
        isUserPlant.value = true;

        // 重新加载植物生长状态
        await loadPlantGrowthStatus();

        ElMessage.success('成功领养植物！请前往"我的花园"照料它');
    } catch (error) {
        console.error('领养植物失败:', error);
        ElMessage.error('领养植物失败，请稍后再试');
    } finally {
        // 关闭加载提示
        loading.close();

        // 冷却结束后重置状态
        isOnCooldown.value = false;
    }
};

// 新增：截断植物描述的方法
const truncateDescription = (description) => {
    const maxLength = 100;
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
};

// 新增：跳转到我的花园方法
const goToMyGarden = () => {
    router.push('/my-garden');
};

// 查看植物详情
const viewDetails = () => {
    router.push(`/plant/${props.plant.id}`);
};

// 新增：执行养护操作方法
const performCareAction = async (actionType) => {
    if (isOnCooldown.value) return;

    isOnCooldown.value = true;

    try {
        await axios.post(`/api/plants/${plantId}/light`);
        ElMessage.success('阳光操作成功！');

        // 重新加载植物状态
        await loadPlantGrowthStatus();
    } catch (error) {
        console.error('阳光操作失败:', error);
        ElMessage.error('阳光操作失败，请稍后再试');
    } finally {
        isOnCooldown.value = false;
    }
};

onMounted(() => {
    // 添加数据监听
    loadPlantGrowthStatus();
    checkPlantAdoptionStatus();
});

// 监听植物ID变化，重新加载状态
watch(() => props.plant.id, () => {
    loadPlantGrowthStatus();
});
</script>

<style scoped>
.plant-card {
    border-radius: var(--border-radius-large);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
}

.plant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.plant-visual-container {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(to bottom, #e8f5e9, #f1f8e9);
    border-top-left-radius: var(--border-radius-large);
    border-top-right-radius: var(--border-radius-large);
    z-index: 6;
    /* 增加下边距，保证 care-actions 区域显示空间 */
    padding-bottom: 50px;
}

.plant-visual {
    position: relative;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.plant-image {
    max-height: 140px;
    max-width: 85%;
    object-fit: contain;
    transition: all 0.5s ease;
}

/* 植物健康状态样式 */
.plant-visual.withered .plant-image {
    filter: grayscale(1) brightness(0.7) opacity(0.8);
    transform: rotate(5deg) scale(0.9);
}

.plant-visual.endangered .plant-image {
    filter: brightness(0.85) saturate(0.9);
    transform: scale(0.95);
}

.plant-visual.healthy .plant-image {
    filter: brightness(1.05) saturate(1.1);
    transform: scale(1.02);
}

/* 植物需求状态样式 */
.plant-visual.needs-water .plant-image {
    filter: opacity(0.85) grayscale(0.2);
}

.plant-visual.needs-light .plant-image {
    filter: brightness(0.9);
}

.plant-visual.needs-nutrient .plant-image {
    filter: saturate(0.9);
}

/* 生长阶段样式 */
.plant-visual.stage-seed .plant-image {
    animation: seedPulse 3s infinite alternate;
}

.plant-visual.stage-sprout .plant-image {
    animation: sproutGrow 4s infinite alternate;
}

.plant-visual.stage-flower .plant-image {
    animation: flowerBloom 5s infinite alternate;
}

.plant-visual.stage-fruit .plant-image {
    animation: fruitRipe 3s infinite alternate;
}

/* 状态指示器 */
.plant-status-indicators {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.status-indicator {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 3px #fff);
    animation: bounce 1s infinite alternate;
}

.withered-indicator {
    filter: drop-shadow(0 0 3px rgba(255, 0, 0, 0.3));
}

/* 生长阶段指示器 */
.growth-stage-indicator {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 1.5rem;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.7));
    animation: float 3s infinite alternate;
}

/* 养护操作按钮 */
.care-actions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20 !important;
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    /* 修改为浅色背景 */
    background-color: rgba(240, 240, 240, 0.95) !important;
    border-top: 1px solid #e0e0e0;
    border-radius: 0 0 var(--border-radius-medium) var(--border-radius-medium);
}

.care-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 8px;
    border: none;
    border-radius: 8px;
    background-color: #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.care-button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.care-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(0.8);
    transform: none !important;
    box-shadow: none !important;
}

.button-icon {
    font-size: 1.2rem;
    margin-bottom: 3px;
}

.button-text {
    font-size: 0.8rem;
    color: #333;
    /* 确保在浅色背景上文字清晰可见 */
}

.water-button {
    background-color: #e3f2fd;
}

.light-button {
    background-color: #fff8e1;
}

.fertilize-button {
    background-color: #e8f5e9;
}

.prune-button {
    background-color: #f5f5f5;
}

.harvest-button {
    background-color: #ffd54f;
    border-color: #ffc107;
}

.restart-button {
    background-color: #4caf50;
    border-color: #2e7d32;
    color: white;
    min-width: 120px;
    animation: pulse-attention 2s infinite;
}

.restart-button .button-icon {
    color: white;
}

.restart-button:hover {
    background-color: #2e7d32;
}

@keyframes pulse-attention {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

/* 收获提示样式 */
.harvest-reminder {
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 193, 7, 0.9);
    color: #7d5700;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 5px;
    z-index: 20;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
}

.harvest-reminder.fade-out {
    animation: fadeOutReminder 1s forwards;
}

@keyframes fadeOutReminder {
    from {
        opacity: 1;
        transform: translateX(-50%) scale(1);
    }

    to {
        opacity: 0;
        transform: translateX(-50%) scale(0.8);
    }
}

.reminder-icon {
    font-size: 1rem;
}

/* 植物信息区 */
.plant-info {
    padding: 15px;
    position: relative;
    z-index: 10;
    /* 确保低于养护操作按钮 */
}

.plant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.plant-header h3 {
    margin: 0;
    color: var(--primary-dark);
    font-size: 1.2rem;
}

.tags-container {
    display: flex;
    gap: 5px;
}

.scientific-name {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.plant-description {
    color: var(--text-primary);
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 15px;
    line-height: 1.4;
    max-height: 5.6em;
    /* 大约4行文本 */
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
}

/* 生长周期进度 */
.growth-progress {
    margin-bottom: 15px;
}

.progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 5px;
}

.plant-status {
    margin-bottom: 15px;
}

.status-label {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.plant-progress {
    margin-bottom: 8px;
}

.progress-row {
    margin-bottom: 8px;
    position: relative;
}

.progress-text {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--text-primary);
    /* 使用主题变量 */
    z-index: 1;
    /* 添加以下内容增强可读性 */
    background-color: rgba(255, 255, 255, 0.8);
    /* 浅色模式下的背景 */
    padding: 0 5px;
    border-radius: 4px;
    font-weight: 500;
}

/* 夜间模式特定样式 */
@media (prefers-color-scheme: dark) {
    .progress-text {
        background-color: rgba(0, 0, 0, 0.7);
        /* 深色模式下的背景 */
        color: white;
        text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }

    .plant-card {
        background-color: var(--bg-card) !important;
        border-color: var(--el-border-color) !important;
    }

    .plant-info {
        background-color: var(--bg-card) !important;
    }

    .plant-header h3 {
        color: var(--text-primary) !important;
    }

    .scientific-name {
        color: var(--text-secondary) !important;
    }

    .progress-text {
        color: white !important;
        /* 添加阴影以增强可读性 */
        text-shadow: 0 0 3px rgba(0, 0, 0, 0.7);
        background-color: rgba(0, 0, 0, 0.5);
        padding: 0 5px;
        border-radius: 3px;
    }

    /* 确保按钮在夜间模式下也有足够对比度 */
    .care-button {
        background-color: #333333 !important;
        border: 1px solid #444444 !important;
        color: #e0e0e0 !important;
    }

    .water-button {
        background-color: rgba(64, 158, 255, 0.2) !important;
    }

    .light-button {
        background-color: rgba(230, 162, 60, 0.2) !important;
    }

    .fertilize-button {
        background-color: rgba(103, 194, 58, 0.2) !important;
    }

    .prune-button {
        background-color: rgba(144, 147, 153, 0.2) !important;
    }

    .harvest-button {
        background-color: rgba(255, 193, 7, 0.2) !important;
        border-color: #ffc107 !important;
    }

    .restart-button {
        background-color: rgba(76, 175, 80, 0.8);
        border-color: rgba(46, 125, 50, 0.8);
    }

    .restart-button:hover {
        background-color: rgba(46, 125, 50, 0.9);
    }

    .care-actions {
        background-color: rgba(40, 40, 40, 0.9) !important;
        border-top: 1px solid #333333;
    }

    .care-button .button-text {
        color: #e0e0e0;
    }

    .plant-visual {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 5px;
    }

    .adopt-button {
        background-color: var(--primary-color) !important;
        color: white !important;
    }

    .plant-description {
        color: var(--text-secondary) !important;
    }

    .harvest-reminder {
        background-color: rgba(255, 193, 7, 0.7);
        color: #fff;
    }

    .clear-tag {
        background-color: #ffd700 !important;
        color: #000 !important;
        border-color: #7d4e00 !important;
    }
}

/* 确保进度条文本区域有足够空间 */
:deep(.el-progress-bar__inner) {
    transition: width 0.3s ease;
}

:deep(.el-progress__text) {
    min-width: 35px;
}

.plant-actions {
    display: flex;
}

.details-button,
.start-button,
.revive-button {
    width: 100%;
}

/* 动画效果 */
.animation-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 220px;
    pointer-events: none;
    z-index: 10;
}

.water-animation {
    position: absolute;
    top: 10%;
    left: 0;
    width: 100%;
    height: 70%;
    animation: waterDropAnim 2s ease-out;
    pointer-events: none;
    z-index: 20;
}

.water-animation::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(33, 150, 243, 0.4) 0%, rgba(33, 150, 243, 0) 100%);
    animation: waterFlowAnim 2s ease-out;
}

.water-animation::after {
    content: '💧';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    animation: dropFallAnim 1.5s ease-in;
}

.light-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
    pointer-events: none;
}

.light-animation::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(255, 235, 59, 0.7) 0%, rgba(255, 235, 59, 0) 70%);
    animation: sunlightAnim 2s ease-in-out;
}

.light-animation::after {
    content: '☀️';
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 24px;
    animation: sunRotateAnim 2s ease-in-out;
}

.fertilize-animation {
    position: absolute;
    bottom: 20%;
    left: 0;
    width: 100%;
    height: 40%;
    z-index: 20;
    pointer-events: none;
}

.fertilize-animation::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 20px;
    background-color: rgba(76, 175, 80, 0.4);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    animation: fertilizerSpreadAnim 2s ease-in-out;
}

.fertilize-animation::after {
    content: '🌱';
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    animation: growUpAnim 2s ease-in-out;
}

.prune-animation {
    position: absolute;
    top: 20%;
    left: 0;
    width: 100%;
    height: 60%;
    z-index: 20;
    pointer-events: none;
}

.prune-animation::before,
.prune-animation::after {
    content: '✂️';
    position: absolute;
    font-size: 24px;
    animation: pruneSnipAnim 2s ease-in-out;
}

.prune-animation::before {
    top: 30%;
    left: 20%;
    animation-delay: 0.3s;
}

.prune-animation::after {
    top: 60%;
    right: 20%;
    animation-delay: 0.8s;
}

.harvest-animation {
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    height: 60%;
    z-index: 20;
    pointer-events: none;
}

.harvest-animation::before {
    content: '🍎';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    animation: harvestPopAnim 2s ease-in-out;
}

@keyframes waterDropAnim {
    0% {
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

@keyframes waterFlowAnim {
    0% {
        opacity: 0;
        transform: translateY(-20px);
    }

    30% {
        opacity: 0.8;
        transform: translateY(0);
    }

    70% {
        opacity: 0.8;
    }

    100% {
        opacity: 0;
        transform: translateY(10px);
    }
}

@keyframes dropFallAnim {
    0% {
        opacity: 0.8;
        transform: translateX(-50%) translateY(0);
    }

    80% {
        opacity: 0.6;
        transform: translateX(-50%) translateY(80px);
    }

    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(100px);
    }
}

@keyframes sunlightAnim {
    0% {
        opacity: 0;
    }

    30% {
        opacity: 0.8;
    }

    70% {
        opacity: 0.8;
    }

    100% {
        opacity: 0;
    }
}

@keyframes sunRotateAnim {
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

@keyframes fertilizerSpreadAnim {
    0% {
        transform: scaleX(0.2);
        opacity: 0;
    }

    40% {
        transform: scaleX(1);
        opacity: 0.8;
    }

    100% {
        transform: scaleX(1.1);
        opacity: 0;
    }
}

@keyframes growUpAnim {
    0% {
        opacity: 0;
        transform: translateX(-50%) translateY(20px) scale(0.5);
    }

    40% {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }

    80% {
        opacity: 1;
        transform: translateX(-50%) translateY(-10px) scale(1.1);
    }

    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(-15px) scale(0.8);
    }
}

@keyframes pruneSnipAnim {
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

@keyframes harvestPopAnim {
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

/* 添加领养按钮样式 */
.catalog-actions {
    margin-bottom: 10px;
}

.adopt-button {
    width: 100%;
    font-weight: 500;
}

/* 添加到<style>部分 */
.clear-tag {
    background-color: #ffd700 !important;
    color: #7d4e00 !important;
    border-color: #7d4e00 !important;
    font-weight: bold;
    padding: 3px 8px;
    display: flex;
    align-items: center;
    gap: 5px;
    animation: glow 2s infinite alternate;
}

.clear-text {
    letter-spacing: 1px;
}

.clear-icon {
    font-size: 14px;
}

@keyframes glow {
    0% {
        box-shadow: 0 0 2px gold;
    }

    100% {
        box-shadow: 0 0 8px gold, 0 0 15px rgba(255, 215, 0, 0.5);
    }
}

@media (prefers-color-scheme: dark) {
    .clear-tag {
        background-color: #ffd700 !important;
        color: #000 !important;
        border-color: #7d4e00 !important;
    }
}

/* 在<style>部分添加 */
.popup-scientific-name {
    font-style: italic;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.popup-description {
    margin-bottom: 15px;
    line-height: 1.5;
    color: var(--text-primary);
}

.popup-era {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

/* 确保弹窗在深色模式下也有正确的样式 */
:deep(.el-popover) {
    max-height: 300px;
    overflow-y: auto;
}

@media (prefers-color-scheme: dark) {
    :deep(.el-popover) {
        background-color: #333;
        border-color: #444;
    }

    .popup-description,
    .popup-era {
        color: #e0e0e0;
    }
}

/* 添加完成状态覆盖层样式 */
.completed-card {
    position: relative;
    opacity: 0.8;
    filter: brightness(0.7) grayscale(0.3);
}

.completed-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 30;
    border-radius: var(--border-radius-large);
}

.completed-badge {
    background-color: rgba(255, 215, 0, 0.9);
    padding: 10px 20px;
    border-radius: 15px;
    color: #000;
    font-weight: bold;
    font-size: 24px;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
    transform: rotate(-15deg);
    box-shadow: 0 0 20px gold;
    animation: badgeGlow 2s infinite alternate;
}

.completed-text {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.7);
}

.completed-icon {
    font-size: 30px;
}

.maintaining-button {
    width: 100%;
    background-color: #67C23A !important;
    border-color: #67C23A !important;
    font-weight: 500;
}

.completed-status {
    text-align: center;
    padding: 8px;
    color: #909399;
    font-style: italic;
}

@keyframes badgeGlow {
    0% {
        box-shadow: 0 0 10px gold;
    }

    100% {
        box-shadow: 0 0 25px gold, 0 0 40px rgba(255, 215, 0, 0.8);
    }
}

/* 黑暗模式适配 */
@media (prefers-color-scheme: dark) {
    .maintaining-button {
        background-color: rgba(103, 194, 58, 0.2) !important;
        border-color: #67C23A !important;
        color: #e0e0e0 !important;
    }

    .completed-badge {
        background-color: rgba(255, 215, 0, 0.8);
        color: #000;
    }

    .completed-status {
        color: #a0a0a0;
    }
}

/* 添加进行中的动画效果 */
@keyframes pulse {
    0% {
        opacity: 0.7;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0.7;
    }
}

.loading-animation {
    animation: pulse 1.5s infinite;
}

.withered-actions {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
