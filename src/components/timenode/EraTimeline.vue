<template>
    <div class="era-timeline-container">
        <h3 class="timeline-title">时间旅行轴</h3>
        <!-- 添加了v-if条件，确保只有在有数据时才渲染slider -->
        <div v-if="loading">
            <el-skeleton animated :rows="1" />
        </div>
        <div v-else-if="eras.length > 0">
            <el-slider v-model="selectedEraIndex" :min="0" :max="Math.max(0, eras.length - 1)"
                :format-tooltip="formatTooltip" @change="changeEra" />
            <div class="era-info" v-if="currentEra">
                <h4>{{ currentEra.name }}</h4>
                <p>{{ currentEra.description || '暂无描述' }}</p>
            </div>
        </div>
        <div v-else class="empty-state">
            <el-empty description="未找到时代数据" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getEras } from '../../api/eras';
import { ElMessage } from 'element-plus';

const eras = ref([]);
const selectedEraIndex = ref(0);
const loading = ref(true);

const currentEra = computed(() => {
    if (eras.value.length > 0 && selectedEraIndex.value >= 0) {
        return eras.value[selectedEraIndex.value];
    }
    return null;
});

const formatTooltip = (index) => {
    if (eras.value[index]) {
        return eras.value[index].name;
    }
    return '';
};

const changeEra = (index) => {
    selectedEraIndex.value = index;
    emit('eraChanged', currentEra.value);
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
    background-color: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;
}

.timeline-title {
    margin-top: 0;
    margin-bottom: 15px;
    color: #303133;
}

.era-info {
    margin-top: 15px;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.era-info h4 {
    margin-top: 0;
    color: #409EFF;
}
</style>