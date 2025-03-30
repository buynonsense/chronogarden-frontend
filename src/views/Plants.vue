<template>
  <div class="plants-container">
    <h1 class="page-title">植物图鉴 <span class="title-emoji">🌱</span></h1>
    <p class="subtitle">穿越时空探索不同时代的神奇植物</p>

    <!-- 增强时间轴组件区域 -->
    <div class="timeline-section">
      <h2>时间旅行轴 <span class="title-emoji">🕰️</span></h2>
      <EraTimeline @eraChanged="handleEraChange" />
    </div>

    <el-card v-if="loading" class="loading-card">
      <el-skeleton :rows="4" animated />
    </el-card>

    <div v-else-if="plants.length === 0" class="empty-state">
      <el-empty description="当前时代没有植物记录" />
    </div>

    <div v-else class="plants-grid">
      <el-card v-for="plant in plants" :key="plant.id" class="plant-card" @click="viewPlantDetails(plant.id)">
        <template #header>
          <div class="plant-header">
            <h3>{{ plant.name }} <span class="plant-emoji">🌱</span></h3>
          </div>
        </template>
        <p class="scientific-name">{{ plant.scientificName }}</p>
        <p class="description">{{ truncateText(plant.description, 100) }}</p>
        <div class="plant-info">
          <p v-if="plant.firstAppearance"><span class="info-emoji">🕰️</span> <strong>首次出现:</strong> {{
            plant.firstAppearance }}
          </p>
          <p v-if="plant.extinctionTime"><span class="info-emoji">⌛</span> <strong>灭绝时间:</strong> {{
            plant.extinctionTime }}</p>
        </div>
        <el-button type="primary" size="small" @click.stop="viewPlantDetails(plant.id)" class="view-details-btn">
          查看详情 <span class="btn-emoji">👀</span>
        </el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPlantsByEra, getPlants } from '../api/plants';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import EraTimeline from '../components/timenode/EraTimeline.vue';

const router = useRouter();
const route = useRoute();
const plants = ref([]);
const loading = ref(true);
const currentEra = ref(null);

const handleEraChange = (era) => {
  if (!era) return;

  console.log('选择的时代:', era);
  currentEra.value = era;
  loadPlantsByEra(era.name);
};

const loadPlantsByEra = async (eraName) => {
  loading.value = true;
  try {
    console.log('开始请求植物数据, era:', eraName);
    const response = await getPlantsByEra(eraName);
    console.log('获取植物数据成功:', response.data);
    plants.value = response.data;
  } catch (error) {
    console.error('获取植物列表失败:', error);
    ElMessage.error('获取植物列表失败');
    plants.value = [];
  } finally {
    loading.value = false;
  }
};

const loadAllPlants = async () => {
  loading.value = true;
  try {
    console.log('开始请求所有植物数据');
    const response = await getPlants();
    console.log('获取所有植物数据成功:', response.data);
    plants.value = response.data;
  } catch (error) {
    console.error('获取植物列表失败:', error);
    ElMessage.error('获取植物列表失败');
    plants.value = [];
  } finally {
    loading.value = false;
  }
};

const viewPlantDetails = (plantId) => {
  router.push(`/plant/${plantId}`);
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

onMounted(() => {
  // 默认加载所有植物，等待时间轴组件触发era变化
  loadAllPlants();
});
</script>

<style scoped>
.plants-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtitle {
  color: #606266;
  margin-bottom: 20px;
}

.loading-card {
  margin-bottom: 20px;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.plant-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: var(--border-radius-large) !important;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.98));
}

.plant-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 30px rgba(87, 188, 144, 0.2) !important;
}

.plant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;
}

.plant-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.3em;
  display: flex;
  align-items: center;
}

.plant-emoji {
  margin-left: 8px;
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.plant-card:hover .plant-emoji {
  transform: rotate(15deg) scale(1.3);
}

.scientific-name {
  font-style: italic;
  color: var(--text-light);
  margin-bottom: 12px;
  font-size: 0.9em;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.6;
  flex-grow: 1;
}

.plant-info {
  margin-bottom: 15px;
  background-color: rgba(165, 214, 167, 0.15);
  padding: 10px;
  border-radius: var(--border-radius-small);
}

.info-emoji {
  display: inline-block;
  margin-right: 5px;
  transition: transform 0.3s ease;
}

.plant-card:hover .info-emoji {
  transform: scale(1.2);
}

.view-details-btn {
  align-self: center;
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.plant-card:hover .view-details-btn {
  background-color: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}

.btn-emoji {
  transition: transform 0.3s ease;
}

.plant-card:hover .btn-emoji {
  transform: translateX(3px);
}

.empty-state {
  margin-top: 40px;
  text-align: center;
}

/* 添加时间轴区域样式 */
.timeline-section {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: var(--border-radius-large);
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.timeline-section h2 {
  font-size: 1.5em;
  color: var(--primary-dark);
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-emoji {
  animation: pulse 2s infinite;
}

@keyframes pulse {
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
</style>