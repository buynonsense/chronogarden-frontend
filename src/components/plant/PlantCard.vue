<template>
    <el-card class="plant-card" :body-style="{ padding: '0' }">
        <div class="plant-visual-container">
            <!-- 植物状态展示区 -->
            <div class="plant-visual" :class="plantStateClass">
                <img :src="getPlantImage()" class="plant-image" alt="植物图片" />

                <!-- 状态指示器 -->
                <div class="plant-status-indicators" v-if="interactive">
                    <div class="status-indicator water-indicator" v-if="waterLevel < 30">💧</div>
                    <div class="status-indicator light-indicator" v-if="lightLevel < 30">☀️</div>
                    <div class="status-indicator nutrient-indicator" v-if="nutrientLevel < 30">🌱</div>
                    <div class="status-indicator withered-indicator" v-if="isWithered">💀</div>
                </div>

                <!-- 生长阶段指示器 -->
                <div class="growth-stage-indicator" v-if="growthStage">
                    {{ getGrowthStageEmoji() }}
                </div>
            </div>

            <!-- 养护操作按钮 -->
            <div class="care-actions" v-if="interactive">
                <button class="care-button water-button" @click="performCare('浇水')"
                    :disabled="isWithered || waterLevel > 90">
                    <span class="button-icon">💧</span>
                    <span class="button-text">浇水</span>
                </button>

                <button class="care-button light-button" @click="performCare('调整光照')"
                    :disabled="isWithered || lightLevel > 90">
                    <span class="button-icon">☀️</span>
                    <span class="button-text">调光</span>
                </button>

                <button class="care-button fertilize-button" @click="performCare('施肥')"
                    :disabled="isWithered || nutrientLevel > 90">
                    <span class="button-icon">🌱</span>
                    <span class="button-text">施肥</span>
                </button>

                <button class="care-button prune-button" @click="performCare('修剪')" :disabled="isWithered">
                    <span class="button-icon">✂️</span>
                    <span class="button-text">修剪</span>
                </button>
            </div>
        </div>

        <!-- 植物信息 -->
        <div class="plant-info">
            <div class="plant-header">
                <h3>{{ plant.name }}</h3>
                <div class="tags-container">
                    <el-tag size="small" v-if="plant.era">{{ plant.era }}</el-tag>
                    <el-tag size="small" type="success" effect="plain" v-if="plant.isCompleted">Clear</el-tag>
                </div>
            </div>

            <p class="scientific-name">{{ plant.scientificName }}</p>

            <!-- 生长周期进度条 -->
            <div class="growth-progress" v-if="growthDays > 0">
                <div class="progress-label">
                    <span>生长周期: {{ getGrowthStageText() }}</span>
                    <span>{{ growthDays }}/14天</span>
                </div>
                <el-progress :percentage="Math.min(100, (growthDays / 14) * 100)" :status="growthProgressStatus">
                </el-progress>
            </div>

            <!-- 植物状态指标 -->
            <div class="plant-status" v-if="!isWithered">
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
                <el-button v-if="isWithered" type="danger" class="revive-button" @click="startGrowth">
                    重新养护
                </el-button>
                <el-button v-else-if="!growthStarted" type="primary" class="start-button" @click="startGrowth">
                    开始养护
                </el-button>
                <el-button v-else type="primary" class="details-button" @click="viewDetails">
                    查看详情
                </el-button>
            </div>
        </div>

        <!-- 特效动画层 -->
        <div class="animation-container" v-if="showAnimation">
            <div :class="animationClass"></div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { addCareRecord } from '../../api/careRecords';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const props = defineProps({
    plant: {
        type: Object,
        required: true
    },
    interactive: {
        type: Boolean,
        default: true
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

        console.log('加载的植物状态:', {
            waterLevel: waterLevel.value,
            lightLevel: lightLevel.value,
            nutrientLevel: nutrientLevel.value
        });
    } catch (error) {
        console.error('获取植物生长状态失败:', error);
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

// 获取属性进度条状态
const getStatProgressStatus = (value) => {
    if (value === 0) return 'exception';
    if (value <= 30) return 'warning';
    return 'normal';
};

// 获取植物图片
const getPlantImage = () => {
    // 基于植物状态和生长阶段返回不同图片
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

    // 构建图片路径
    return `/images/plants/${statePrefix}${type}_${stageSuffix}.png`;
};

// 执行养护操作
const performCare = async (actionType) => {
    if (isWithered.value) return;

    // 显示动画效果
    showAnimation.value = true;

    // 根据操作类型设置不同动画并更新植物状态
    switch (actionType) {
        case '浇水':
            animationClass.value = 'water-animation';
            waterLevel.value = Math.min(100, waterLevel.value + 60);
            break;

        case '调整光照':
            animationClass.value = 'light-animation';
            lightLevel.value = Math.min(100, lightLevel.value + 60);
            break;

        case '施肥':
            animationClass.value = 'fertilize-animation';
            nutrientLevel.value = Math.min(100, nutrientLevel.value + 60);
            break;

        case '修剪':
            animationClass.value = 'prune-animation';
            // 修剪可能影响所有生长参数
            waterLevel.value = Math.min(100, waterLevel.value + 15);
            lightLevel.value = Math.min(100, lightLevel.value + 25);
            nutrientLevel.value = Math.min(100, nutrientLevel.value + 20);
            break;
    }

    try {
        // 记录养护操作并通知后端
        await addCareRecord({
            plant: { id: props.plant.id },
            actionType: actionType,
            notes: '' // 自动操作不需要备注
        });

        // 重新获取植物状态
        await loadPlantGrowthStatus();

        ElMessage.success({
            message: `${actionType}成功!`,
            duration: 1500
        });

    } catch (error) {
        console.error('养护操作失败:', error);
        ElMessage.error('养护操作失败');
    } finally {
        // 3秒后隐藏动画
        setTimeout(() => {
            showAnimation.value = false;
        }, 3000);
    }
};

// 开始植物养护
const startGrowth = async () => {
    try {
        await axios.post(`/api/plants/${props.plant.id}/start-growth`);

        // 记录养护记录
        await addCareRecord({
            plant: { id: props.plant.id },
            actionType: isWithered.value ? '重新养护' : '开始养护',
            notes: '开始植物生长周期'
        });

        // 重新加载植物状态
        await loadPlantGrowthStatus();

        ElMessage.success(isWithered.value ? '植物重新养护成功!' : '开始养护植物!');

    } catch (error) {
        console.error('开始养护失败:', error);
        ElMessage.error('开始养护失败，请稍后再试');
    }
};

// 查看详情
const viewDetails = () => {
    router.push(`/plant/${props.plant.id}`);
};

onMounted(() => {
    // 添加数据监听
    loadPlantGrowthStatus();
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
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.8);
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
}

.button-icon {
    font-size: 1.2rem;
    margin-bottom: 3px;
}

.button-text {
    font-size: 0.8rem;
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

/* 植物信息区 */
.plant-info {
    padding: 15px;
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
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--el-text-color-regular);
    z-index: 1;
    /* 确保文本显示在最上层 */
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
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 100px;
    background: url('/images/effects/water-effect.png') no-repeat center;
    background-size: contain;
    animation: waterDrop 2s ease-in;
    opacity: 0;
}

.light-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 160px;
    background: radial-gradient(ellipse at center, rgba(255, 247, 130, 0.8) 0%, rgba(255, 247, 130, 0) 70%);
    animation: sunlight 3s ease-in-out;
}

.fertilize-animation {
    position: absolute;
    bottom: 40%;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 50px;
    background: url('/images/effects/fertilize-effect.png') no-repeat center;
    background-size: contain;
    animation: fertilizer 2s ease-in;
    opacity: 0;
}

.prune-animation {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: url('/images/effects/prune-effect.png') no-repeat center;
    background-size: contain;
    animation: pruning 1.5s ease-in-out;
    opacity: 0;
}

/* 动画关键帧 */
@keyframes bounce {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-5px);
    }
}

@keyframes float {
    0% {
        transform: translateY(0) rotate(0);
    }

    100% {
        transform: translateY(-5px) rotate(5deg);
    }
}

@keyframes waterDrop {
    0% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }

    80% {
        opacity: 0.8;
    }

    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(100px);
    }
}

@keyframes sunlight {
    0% {
        opacity: 0;
    }

    30% {
        opacity: 0.7;
    }

    70% {
        opacity: 0.7;
    }

    100% {
        opacity: 0;
    }
}

@keyframes fertilizer {
    0% {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
    }

    20% {
        opacity: 1;
    }

    80% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }

    100% {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
    }
}

@keyframes pruning {
    0% {
        opacity: 0;
        transform: translateX(-60%) rotate(-30deg);
    }

    20% {
        opacity: 1;
    }

    40% {
        transform: translateX(-40%) rotate(20deg);
    }

    60% {
        transform: translateX(-60%) rotate(-10deg);
    }

    80% {
        opacity: 1;
        transform: translateX(-40%) rotate(0);
    }

    100% {
        opacity: 0;
        transform: translateX(-50%) rotate(0);
    }
}

/* 植物生长阶段动画 */
@keyframes seedPulse {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(1.05);
    }
}

@keyframes sproutGrow {
    0% {
        transform: translateY(2px) scale(0.98);
    }

    100% {
        transform: translateY(-2px) scale(1.02);
    }
}

@keyframes flowerBloom {
    0% {
        transform: rotate(-2deg);
    }

    100% {
        transform: rotate(2deg);
    }
}

@keyframes fruitRipe {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.04);
    }

    100% {
        transform: scale(1);
    }
}

/* 新增动画效果 */
/* 图片轻微晃动 */
@keyframes sway {
    0% {
        transform: rotate(-2deg);
    }

    100% {
        transform: rotate(2deg);
    }
}

/* 呼吸效果 */
@keyframes breathe {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(1.05);
    }
}

/* 生长效果 */
@keyframes grow {
    0% {
        transform: translateY(5px) scale(0.95);
    }

    100% {
        transform: translateY(-5px) scale(1.05);
    }
}

/* 水滴效果 */
.water-effect {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background-color: #4fc3f7;
    border-radius: 50%;
    opacity: 0.8;
    animation: dropFall 1.5s linear infinite;
}

@keyframes dropFall {
    0% {
        transform: translateX(-50%) translateY(0) scale(1);
        opacity: 0.8;
    }

    80% {
        transform: translateX(-50%) translateY(80px) scale(1.5);
        opacity: 0.5;
    }

    100% {
        transform: translateX(-50%) translateY(100px) scale(2);
        opacity: 0;
    }
}
</style>