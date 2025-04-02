<template>
    <div class="era-timeline-container">
        <div v-if="loading">
            <el-skeleton animated :rows="1" />
        </div>
        <div v-else-if="eras.length > 0" class="timeline-wrapper">
            <!-- 添加@change事件用于处理滑块释放 -->
            <el-slider v-model="sliderValue" :min="0" :max="Math.max(0, eras.length - 1)"
                :format-tooltip="formatTooltip" @input="handleSliderInput" @change="handleSliderChange"
                :marks="timelineMarks" :show-stops="true" :step="0.01" :show-tooltip="true" />

            <!-- 时代描述信息 -->
            <transition name="fade">
                <div class="era-info" v-if="currentEra">
                    <div class="era-info-header">
                        <h4>{{ currentEra.name }}</h4>
                        <el-tag v-if="currentEra.period" size="small" effect="light">{{ currentEra.period }}</el-tag>
                    </div>
                    <p>{{ currentEra.description || '暂无描述' }}</p>
                </div>
            </transition>
        </div>
        <div v-else class="empty-state">
            <el-empty description="未找到时代数据" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getEras } from '../../api/eras';
import { ElMessage } from 'element-plus';

const eras = ref([]);
const selectedEraIndex = ref(0);
const sliderValue = ref(0); // 用于平滑滑动的小数值
const loading = ref(true);

// 添加时间轴刻度标记
const timelineMarks = computed(() => {
    const marks = {};
    eras.value.forEach((era, index) => {
        // 如果时代太多，只显示部分时代名称作为刻度
        if (eras.value.length <= 8 || index % Math.ceil(eras.value.length / 8) === 0) {
            marks[index] = {
                label: era.name.substring(0, 4) // 截取前4个字符，避免太长
            };
        } else {
            marks[index] = ''; // 空标记，只显示刻度点
        }
    });
    return marks;
});

const currentEra = computed(() => {
    if (eras.value.length > 0 && selectedEraIndex.value >= 0) {
        return eras.value[selectedEraIndex.value];
    }
    return null;
});

// 判断滑块是否位于节点位置（整数值附近）
const isNearNode = (value) => {
    const nearestInt = Math.round(value);
    // 定义"接近"节点的范围，比如±0.05
    return Math.abs(value - nearestInt) < 0.05;
};

// 处理滑块拖动中的值变化
const handleSliderInput = (value) => {
    // 存储精确的滑块值以实现平滑拖动
    sliderValue.value = value;

    // 只有当滑块接近节点位置时才更新画面
    if (isNearNode(value)) {
        const nodeIndex = Math.round(value);
        if (nodeIndex !== selectedEraIndex.value) {
            selectedEraIndex.value = nodeIndex;
            emit('eraChanged', eras.value[nodeIndex]);
        }
    }
};

// 处理滑块释放（鼠标松开）
const handleSliderChange = (value) => {
    // 滑块释放时，自动吸附到最近的节点
    const nearestNode = Math.round(value);

    // 更新滑块值为整数，实现吸附效果
    sliderValue.value = nearestNode;

    // 更新选中的时代
    if (nearestNode !== selectedEraIndex.value) {
        selectedEraIndex.value = nearestNode;
        emit('eraChanged', eras.value[nearestNode]);
    }
};

// 自定义工具提示，以显示当前和临近时代
const formatTooltip = (value) => {
    const index = Math.round(value);
    if (eras.value[index]) {
        return eras.value[index].name;
    }
    return '';
};

const loadEras = async () => {
    loading.value = true;
    try {
        console.log('开始请求eras数据');
        const response = await getEras();
        console.log('获取eras数据成功:', response.data);
        eras.value = response.data;

        // 只在有数据时才触发事件
        if (eras.value.length > 0) {
            selectedEraIndex.value = 0; // 重置选择的索引
            sliderValue.value = 0; // 同步滑块值
            emit('eraChanged', eras.value[0]);
        }
    } catch (error) {
        console.error('获取时代数据失败:', error);
        ElMessage.error('获取时代数据失败');
    } finally {
        loading.value = false;
    }
};

// 声明事件
const emit = defineEmits(['eraChanged']);

onMounted(() => {
    loadEras();
});
</script>

<style scoped>
.era-timeline-container {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.05);
}

.timeline-wrapper {
    position: relative;
}

/* 增强滑块样式，使其更平滑 */
:deep(.el-slider__runway) {
    height: 8px;
    background: linear-gradient(to right, rgba(87, 188, 144, 0.1), rgba(87, 188, 144, 0.3), rgba(87, 188, 144, 0.1));
    border-radius: 4px;
}

:deep(.el-slider__bar) {
    height: 8px;
    background: linear-gradient(to right, var(--primary-light), var(--primary-color));
    border-radius: 4px;
}

:deep(.el-slider__button) {
    width: 20px;
    height: 20px;
    border: 2px solid var(--primary-color);
    background-color: white;
    transition: transform 0.2s ease;
    box-shadow: 0 0 10px rgba(87, 188, 144, 0.3);
}

:deep(.el-slider__button:hover) {
    transform: scale(1.2);
}

:deep(.el-slider__marks) {
    top: 14px;
    font-size: 12px;
}

:deep(.el-slider__stop) {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--primary-light);
    top: 0px;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

/* 为节点添加高亮效果 */
:deep(.el-slider__stop) {
    box-shadow: 0 0 5px rgba(87, 188, 144, 0.5);
}

/* 为轨道添加波浪效果 */
:deep(.el-slider__runway::before) {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: repeating-linear-gradient(45deg,
            transparent,
            transparent 5px,
            rgba(87, 188, 144, 0.05) 5px,
            rgba(87, 188, 144, 0.05) 10px);
    border-radius: 4px;
    opacity: 0.7;
}

.era-info {
    margin-top: 25px;
    padding: 15px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.era-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.era-info h4 {
    margin: 0;
    color: var(--primary-dark);
    font-size: 1.2em;
}

.era-info p {
    margin: 10px 0 0;
    line-height: 1.6;
    color: var(--text-secondary);
}

.empty-state {
    padding: 20px;
    background-color: white;
    border-radius: 10px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
    :deep(.el-slider__marks) {
        display: none;
    }

    .era-info {
        padding: 10px;
    }
}

/* 添加深色模式样式 */
@media (prefers-color-scheme: dark) {
    .era-info {
        background-color: #2c2c2c;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        color: var(--text-primary);
    }

    .era-info h4 {
        color: var(--primary-light);
    }

    .era-info p {
        color: var(--text-secondary);
    }

    .empty-state {
        background-color: #2c2c2c;
        color: var(--text-secondary);
    }

    .era-timeline-container {
        background-color: #252525;
        border: 1px solid #333333;
    }
}

/* 添加在已有样式的末尾 */

/* 处理时代周期标签在移动端的换行 */
:deep(.el-tag) {
    white-space: normal !important;
    /* 允许文本换行 */
    max-width: 100%;
    /* 限制最大宽度 */
    height: auto;
    /* 高度自适应内容 */
    line-height: 1.5;
    /* 增加行高 */
    padding: 4px 8px;
    /* 调整内边距 */
    margin-bottom: 5px;
    /* 增加底部间距 */
    word-wrap: break-word;
    /* 允许单词内换行 */
    text-align: center;
    /* 文本居中 */
}

/* 在小屏幕上增加特殊处理 */
@media (max-width: 768px) {
    :deep(.el-tag) {
        display: inline-block;
        margin-top: 5px;
        font-size: 12px;
    }

    .era-info-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .era-info-header h4 {
        margin-bottom: 8px;
    }
}
</style>