<template>
    <el-card class="plant-card" :body-style="{ padding: '0' }">
        <div class="plant-visual-container">
            <!-- 植物动态展示区 -->
            <div class="plant-visual" :class="{ 'needs-water': needsWater, 'needs-light': needsLight }">
                <img :src="getPlantImage()" class="plant-image" alt="植物图片" />
                <!-- 植物状态指示器 -->
                <div class="plant-status-indicators" v-if="interactive">
                    <div class="water-indicator" v-if="needsWater">💧</div>
                    <div class="light-indicator" v-if="needsLight">☀️</div>
                    <div class="fertilizer-indicator" v-if="needsFertilizer">🌱</div>
                </div>
            </div>

            <!-- 养护操作按钮组 -->
            <div class="care-actions" v-if="interactive">
                <button class="care-button water-button" @click="performCare('浇水')" :disabled="!needsWater">
                    <span class="button-icon">💧</span>
                    <span class="button-text">浇水</span>
                </button>
                <button class="care-button light-button" @click="performCare('调整光照')" :disabled="!needsLight">
                    <span class="button-icon">☀️</span>
                    <span class="button-text">调光</span>
                </button>
                <button class="care-button fertilize-button" @click="performCare('施肥')" :disabled="!needsFertilizer">
                    <span class="button-icon">🌱</span>
                    <span class="button-text">施肥</span>
                </button>
                <button class="care-button prune-button" @click="performCare('修剪')">
                    <span class="button-icon">✂️</span>
                    <span class="button-text">修剪</span>
                </button>
            </div>
        </div>

        <!-- 植物信息 -->
        <div class="plant-info">
            <div class="plant-header">
                <h3>{{ plant.name }}</h3>
                <el-tag size="small" v-if="plant.era">{{ plant.era }}</el-tag>
            </div>
            <p class="scientific-name">{{ plant.scientificName }}</p>
            <div class="plant-status">
                <el-progress :percentage="waterLevel" color="#409EFF" :format="() => '水分'"
                    class="plant-progress"></el-progress>
                <el-progress :percentage="lightLevel" color="#E6A23C" :format="() => '光照'"
                    class="plant-progress"></el-progress>
                <el-progress :percentage="nutrientLevel" color="#67C23A" :format="() => '养分'"
                    class="plant-progress"></el-progress>
            </div>
            <el-button type="primary" class="details-button" @click="viewDetails">查看详情</el-button>
        </div>

        <!-- 动画效果层 -->
        <div class="animation-layer" v-if="showAnimation">
            <div :class="animationClass"></div>
        </div>
    </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { addCareRecord } from '../../api/careRecords';
import { ElMessage } from 'element-plus';

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
const waterLevel = ref(Math.floor(Math.random() * 100));
const lightLevel = ref(Math.floor(Math.random() * 100));
const nutrientLevel = ref(Math.floor(Math.random() * 100));
const showAnimation = ref(false);
const animationClass = ref('');

// 计算属性: 植物是否需要特定养护
const needsWater = computed(() => waterLevel.value < 30);
const needsLight = computed(() => lightLevel.value < 30);
const needsFertilizer = computed(() => nutrientLevel.value < 30);

// 获取植物图片 (根据植物类型和状态)
const getPlantImage = () => {
    // 这里应该根据植物类型、成长阶段和健康状态返回不同的图片
    // 示例逻辑，实际应基于真实图片集
    const healthStatus = Math.min(waterLevel.value, lightLevel.value, nutrientLevel.value);
    let imageUrl = '/src/assets/images/plants/default-plant.png';

    if (healthStatus < 30) {
        imageUrl = `/src/assets/images/plants/${props.plant.type || 'default'}_unhealthy.png`;
    } else if (healthStatus < 70) {
        imageUrl = `/src/assets/images/plants/${props.plant.type || 'default'}_normal.png`;
    } else {
        imageUrl = `/src/assets/images/plants/${props.plant.type || 'default'}_thriving.png`;
    }

    // 如果图片不存在，返回默认图片
    return imageUrl;
};

// 执行养护操作
const performCare = async (actionType) => {
    // 显示相应动画
    showAnimation.value = true;

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
            waterLevel.value = Math.min(100, waterLevel.value + 20);
            lightLevel.value = Math.min(100, lightLevel.value + 20);
            nutrientLevel.value = Math.min(100, nutrientLevel.value + 20);
            break;
    }

    // 自动记录养护操作，无需备注
    try {
        await addCareRecord({
            plant: { id: props.plant.id },
            actionType: actionType,
            notes: '' // 自动记录无需备注
        });

        ElMessage.success({
            message: `${actionType}成功!`,
            duration: 1500
        });

        // 3秒后隐藏动画
        setTimeout(() => {
            showAnimation.value = false;
        }, 3000);

    } catch (error) {
        console.error('记录养护操作失败:', error);
        ElMessage.error('记录养护操作失败');
    }
};

// 查看详情
const viewDetails = () => {
    router.push(`/plant/${props.plant.id}`);
};

// 随机模拟植物需求变化
onMounted(() => {
    // 真实实现中这应该基于上次养护时间和植物需求特性
    if (props.interactive) {
        const decreaseStats = () => {
            // 每小时减少1-3点
            waterLevel.value = Math.max(0, waterLevel.value - Math.floor(Math.random() * 3) - 1);
            lightLevel.value = Math.max(0, lightLevel.value - Math.floor(Math.random() * 3) - 1);
            nutrientLevel.value = Math.max(0, nutrientLevel.value - Math.floor(Math.random() * 3) - 1);
            setTimeout(decreaseStats, 3600000); // 每小时更新
        };

        // 初始化时随机减少一些
        setTimeout(decreaseStats, 5000);
    }
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

.plant-visual.needs-water .plant-image {
    filter: opacity(0.7) grayscale(0.3);
    transform: scale(0.95);
}

.plant-visual.needs-light .plant-image {
    filter: brightness(0.85) grayscale(0.2);
}

.plant-status-indicators {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.water-indicator,
.light-indicator,
.fertilizer-indicator {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 3px #fff);
    animation: bounce 1s infinite alternate;
}

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

.scientific-name {
    font-style: italic;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.plant-status {
    margin-bottom: 15px;
}

.plant-progress {
    margin-bottom: 8px;
}

.details-button {
    width: 100%;
}

/* 动画效果 */
.animation-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
    background: url('/src/assets/images/animations/water-drop.png') no-repeat center;
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
    background: url('/src/assets/images/animations/fertilizer.png') no-repeat center;
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
    background: url('/src/assets/images/animations/scissors.png') no-repeat center;
    background-size: contain;
    animation: pruning 1.5s ease-in-out;
    opacity: 0;
}

@keyframes bounce {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-5px);
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
</style>