<template>
    <div class="garden-container">
        <h1 class="page-title">我的花园 <span class="title-emoji">🌿</span></h1>
        <p class="subtitle">在这里照料您领养的珍稀植物</p>

        <el-card v-if="loading" class="loading-card">
            <el-skeleton :rows="4" animated />
        </el-card>

        <div v-else>
            <!-- 植物卡片列表 -->
            <el-tabs v-model="activeTab" class="garden-tabs">
                <el-tab-pane label="养护中" name="active">
                    <div v-if="activePlants.length === 0" class="empty-state">
                        <el-empty description="您没有正在养护的植物">
                            <el-button type="primary" @click="$router.push('/plants')">
                                前往植物图鉴领养植物
                            </el-button>
                        </el-empty>
                    </div>
                    <div v-else class="plants-grid">
                        <PlantCard v-for="plant in activePlants" :key="plant.id" :plant="plant" :showCareActions="true"
                            @data-updated="loadUserPlants">
                            <!-- 将插槽名称从extra-actions改为action-buttons -->
                            <template #action-buttons>
                                <el-button type="info" size="small" @click.stop="showPlantChart(plant)"
                                    class="chart-button">
                                    <i class="chart-icon">📊</i> 状态图
                                </el-button>
                            </template>
                        </PlantCard>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="已完成" name="completed">
                    <div v-if="completedPlants.length === 0" class="empty-state">
                        <el-empty description="您还没有完成养护的植物">
                            <el-button type="primary" @click="activeTab = 'active'">
                                查看养护中植物
                            </el-button>
                        </el-empty>
                    </div>
                    <div v-else class="plants-grid">
                        <PlantCard v-for="plant in completedPlants" :key="plant.id" :plant="plant"
                            :showCareActions="false" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>

        <!-- 植物状态图表弹窗 -->
        <el-dialog v-model="chartDialogVisible" title="植物生长状态图表" width="80%" :before-close="handleCloseChartDialog"
            destroy-on-close>
            <div v-if="selectedPlant" class="chart-container">
                <h3>{{ selectedPlant.name }} 生长状态历史</h3>
                <div id="plantChart" class="plant-chart" ref="plantChartRef"></div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElEmpty } from 'element-plus';
import * as echarts from 'echarts'; // 添加 echarts 导入
import PlantCard from '../components/plant/PlantCard.vue';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const myPlants = ref([]);
const loading = ref(true);
const activeTab = ref('active');

// 图表相关变量
const chartDialogVisible = ref(false);
const selectedPlant = ref(null);
const plantChartRef = ref(null);
let chartInstance = null;

// 过滤植物为养护中和已完成两类
const activePlants = computed(() => {
    return myPlants.value.filter(plant => !plant.isCompleted);
});

const completedPlants = computed(() => {
    return myPlants.value.filter(plant => plant.isCompleted);
});

// 加载用户的植物
const loadUserPlants = async () => {
    try {
        loading.value = true;
        // 使用正确的API端点 - 原来是 /api/plants/my-plants
        const response = await axios.get('/api/plants/user/adopted');
        myPlants.value = response.data;
    } catch (error) {
        console.error('获取我的植物失败:', error);
        ElMessage.error('获取我的植物失败');
    } finally {
        loading.value = false;
    }
};

// 显示植物统计图表
const showPlantChart = async (plant) => {
    selectedPlant.value = plant;
    chartDialogVisible.value = true;

    // 等待DOM更新后初始化图表
    await nextTick();

    try {
        // 获取植物生长历史数据
        const response = await axios.get(`/api/plants/${plant.id}/status-history`);
        const historyData = response.data;

        initChart(historyData);
    } catch (error) {
        console.error('加载植物状态历史失败:', error);
        ElMessage.error('加载植物状态历史失败');
    }
};

// 关闭图表对话框
const handleCloseChartDialog = () => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    chartDialogVisible.value = false;
};

// 初始化图表
const initChart = (historyData) => {
    if (!plantChartRef.value) return;

    // 销毁可能存在的图表实例
    if (chartInstance) {
        chartInstance.dispose();
    }

    // 处理数据
    const dates = historyData.map(item => formatDate(item.timestamp));
    const waterLevels = historyData.map(item => item.waterLevel);
    const lightLevels = historyData.map(item => item.lightLevel);
    const nutrientLevels = historyData.map(item => item.nutrientLevel);
    const growthStages = historyData.map(item => {
        switch (item.growthStage) {
            case 'seed': return '种子';
            case 'sprout': return '发芽';
            case 'flower': return '开花';
            case 'fruit': return '结果';
            default: return '未知';
        }
    });

    // 创建图表实例
    chartInstance = echarts.init(plantChartRef.value);

    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const textColor = isDarkMode ? '#ddd' : '#333';
    const gridColor = isDarkMode ? '#555' : '#ddd';
    const backgroundColor = isDarkMode ? 'rgba(40,40,40,0.8)' : 'rgba(255,255,255,0.8)';

    // 配置图表选项
    const option = {
        backgroundColor: 'transparent',
        title: {
            text: `${selectedPlant.value.name} 生长状态变化`,
            left: 'center',
            textStyle: {
                color: textColor
            }
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: backgroundColor,
            borderWidth: 0,
            textStyle: {
                color: textColor
            },
            formatter: function (params) {
                let result = params[0].name + '<br/>';

                // 添加生长阶段信息
                const stageIndex = params[0].dataIndex;
                result += `<div style="margin: 6px 0;">生长阶段: <strong>${growthStages[stageIndex] || '未知'}</strong></div>`;

                // 添加各状态值
                params.forEach(param => {
                    if (param.seriesName === '生长阶段') return;

                    let color = '';
                    switch (param.seriesName) {
                        case '水分': color = '#409EFF'; break;
                        case '光照': color = '#E6A23C'; break;
                        case '养分': color = '#67C23A'; break;
                    }

                    result += `<div style="display:flex;justify-content:space-between;min-width:150px;">
            <span style="display:inline-block;margin-right:5px;width:12px;height:12px;border-radius:6px;background-color:${color};"></span>
            <span style="flex:1;">${param.seriesName}: </span>
            <span style="float:right;font-weight:bold;">${param.value}%</span>
          </div>`;
                });

                return result;
            }
        },
        legend: {
            data: ['水分', '光照', '养分'],
            bottom: 0,
            textStyle: {
                color: textColor
            }
        },
        grid: {
            left: 40,
            right: 40,
            top: 60,
            bottom: 80
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 30,
                color: textColor,
                fontSize: 11,
                formatter: function (value) {
                    // 简化日期显示
                    return value.replace(/(\d+)\/(\d+)\s/, '$1/$2\n');
                }
            },
            axisLine: {
                lineStyle: {
                    color: gridColor
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '状态值',
            min: 0,
            max: 100,
            splitNumber: 5,
            axisLabel: {
                formatter: '{value}%',
                color: textColor
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: gridColor
                }
            },
            splitLine: {
                lineStyle: {
                    color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }
            }
        },
        series: [
            {
                name: '水分',
                type: 'line',
                smooth: true,
                symbol: 'emptyCircle',
                symbolSize: 6,
                data: waterLevels,
                itemStyle: {
                    color: '#409EFF'
                },
                lineStyle: {
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(64, 158, 255, 0.5)'
                        }, {
                            offset: 1, color: 'rgba(64, 158, 255, 0.05)'
                        }]
                    }
                }
            },
            {
                name: '光照',
                type: 'line',
                smooth: true,
                symbol: 'emptyCircle',
                symbolSize: 6,
                data: lightLevels,
                itemStyle: {
                    color: '#E6A23C'
                },
                lineStyle: {
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(230, 162, 60, 0.5)'
                        }, {
                            offset: 1, color: 'rgba(230, 162, 60, 0.05)'
                        }]
                    }
                }
            },
            {
                name: '养分',
                type: 'line',
                smooth: true,
                symbol: 'emptyCircle',
                symbolSize: 6,
                data: nutrientLevels,
                itemStyle: {
                    color: '#67C23A'
                },
                lineStyle: {
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(103, 194, 58, 0.5)'
                        }, {
                            offset: 1, color: 'rgba(103, 194, 58, 0.05)'
                        }]
                    }
                }
            }
        ]
    };

    // 设置图表
    chartInstance.setOption(option);

    // 响应窗口大小变化
    const resizeChart = () => {
        chartInstance && chartInstance.resize();
    };

    window.addEventListener('resize', resizeChart);

    // 确保在组件销毁时卸载事件监听
    onUnmounted(() => {
        window.removeEventListener('resize', resizeChart);
    });
};

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 组件挂载
onMounted(() => {
    loadUserPlants();
});

// 路由变化时刷新数据
watch(() => route.path, () => {
    if (route.path === '/my-garden') {
        loadUserPlants();
    }
});

// 组件卸载时清理图表实例
onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
});
</script>

<style scoped>
.garden-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-dark);
}

.title-emoji {
    animation: pulse 2s infinite;
}

.subtitle {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

.garden-tabs {
    margin-top: 20px;
}

.plants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    margin-top: 20px;
}

.empty-state {
    margin: 60px auto;
    text-align: center;
    max-width: 500px;
}

.chart-container {
    padding: 5px;
}

.chart-container h3 {
    text-align: center;
    margin-bottom: 20px;
    color: var(--primary-color);
    font-size: 18px;
}

.plant-chart {
    width: 100%;
    height: 500px;
}

/* 自定义标签页样式 */
:deep(.el-tabs__item) {
    font-size: 16px;
    padding: 0 25px;
}

:deep(.el-tabs__item.is-active) {
    color: var(--primary-color);
    font-weight: bold;
}

:deep(.el-tabs__active-bar) {
    background-color: var(--primary-color);
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

@media (prefers-color-scheme: dark) {
    .garden-container {
        background-color: var(--bg-lightest);
    }

    :deep(.el-tabs__item) {
        color: var(--text-secondary);
    }

    :deep(.el-tabs__item.is-active) {
        color: var(--primary-light);
    }
}

/* 图表相关样式 */
.chart-button {
    background-color: rgba(64, 158, 255, 0.1);
    border: 1px solid rgba(64, 158, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 4px;
    color: #409EFF;
    transition: all 0.3s;
}

.chart-button:hover {
    background-color: rgba(64, 158, 255, 0.2);
    transform: translateY(-2px);
}

.chart-icon {
    font-size: 14px;
    transition: transform 0.3s;
}

.chart-button:hover .chart-icon {
    transform: scale(1.2);
}

@media (prefers-color-scheme: dark) {
    .chart-button {
        background-color: rgba(64, 158, 255, 0.15);
        border-color: rgba(64, 158, 255, 0.3);
        color: #69b1ff;
    }

    .chart-button:hover {
        background-color: rgba(64, 158, 255, 0.25);
    }

    .chart-container h3 {
        color: var(--primary-light);
    }

    :deep(.el-dialog) {
        background-color: #2c2c2c;
    }

    :deep(.el-dialog__title) {
        color: #e0e0e0;
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .plant-chart {
        height: 350px;
    }
}
</style>