<template>
  <div class="timenodes-container">
    <h1>时间节点</h1>
    <p class="description">选择一个时间节点，探索不同时期特有的植物和环境</p>

    <el-row :gutter="20" v-if="loading">
      <el-col :span="24" class="loading-container">
        <el-skeleton :rows="5" animated />
      </el-col>
    </el-row>

    <el-row :gutter="20" v-else-if="timeNodes.length > 0">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="timeNode in timeNodes" :key="timeNode.id">
        <el-card class="time-node-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h2>{{ timeNode.name }}</h2>
              <el-tag>{{ timeNode.period }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <p>{{ timeNode.description }}</p>
            <div class="environment-info">
              <h3>环境信息</h3>
              <p><strong>气候：</strong>{{ timeNode.climate }}</p>
              <p><strong>环境因素：</strong>{{ timeNode.environmentalFactors }}</p>
            </div>
            <div class="card-actions">
              <el-button type="primary" @click="viewPlants(timeNode.id)">
                查看植物
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-else description="暂无时间节点数据"></el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTimeNodes } from '../api/timeNodes';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const timeNodes = ref([]);
const loading = ref(true);

const loadTimeNodes = async () => {
  try {
    loading.value = true;
    const response = await getTimeNodes();
    timeNodes.value = response.data;
  } catch (error) {
    console.error('获取时间节点失败:', error);
    ElMessage.error('获取时间节点数据失败');
  } finally {
    loading.value = false;
  }
};

const viewPlants = (timeNodeId) => {
  router.push({
    path: '/plants',
    query: { timeNodeId }
  });
};

onMounted(() => {
  loadTimeNodes();
});
</script>

<style scoped>
.timenodes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.description {
  color: #666;
  margin-bottom: 30px;
}

.loading-container {
  padding: 20px;
}

.time-node-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.environment-info {
  margin: 15px 0;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
}

.environment-info h3 {
  margin-top: 0;
  font-size: 1rem;
}

.card-actions {
  margin-top: auto;
  text-align: center;
}
</style>