<template>
    <div class="home-container">
        <div class="hero-section">
            <h1>时间旅行植物养成模拟器 <span class="emoji">🌿⏰</span></h1>
            <p class="subtitle">穿越时空，培育各个时代的神奇植物</p>
            <div class="cta-buttons">
                <el-button type="primary" size="large" @click="$router.push('/login')" v-if="!isAuthenticated"
                    class="cta-button">
                    开始旅程 🚀
                </el-button>
                <el-button type="success" size="large" @click="$router.push('/dashboard')" v-else class="cta-button">
                    进入花园 🏡
                </el-button>
            </div>
        </div>

        <div class="features-section">
            <el-row :gutter="30">
                <el-col :xs="24" :sm="8">
                    <el-card class="feature-card">
                        <template #header>
                            <div class="card-header">
                                <h3>穿越时空 <span class="emoji">🕰️</span></h3>
                            </div>
                        </template>
                        <p>探索不同历史时期的环境与植物，从远古时代到遥远的未来</p>
                        <div class="card-icon">🌎</div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="8">
                    <el-card class="feature-card">
                        <template #header>
                            <div class="card-header">
                                <h3>培育珍稀植物 <span class="emoji">🌱</span></h3>
                            </div>
                        </template>
                        <p>照料各个时代特有的植物种类，掌握不同时期的养护技巧</p>
                        <div class="card-icon">🌵</div>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="8">
                    <el-card class="feature-card">
                        <template #header>
                            <div class="card-header">
                                <h3>记录成长历程 <span class="emoji">📝</span></h3>
                            </div>
                        </template>
                        <p>详细记录植物的成长过程，见证植物在你的照料下茁壮成长</p>
                        <div class="card-icon">📊</div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <div class="time-bubbles">
            <div class="bubble" v-for="(bubble, i) in bubbles" :key="i" :style="bubbleStyle(bubble)">
                {{ bubble.emoji }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../store/user';

const userStore = useUserStore();
const isAuthenticated = computed(() => userStore.isAuthenticated);

// 创建漂浮气泡
const bubbles = ref([
    { emoji: '🌿', x: 10, y: 20, size: 30, speed: 0.8 },
    { emoji: '🌱', x: 30, y: 50, size: 20, speed: 0.5 },
    { emoji: '🌴', x: 70, y: 10, size: 35, speed: 0.7 },
    { emoji: '🌸', x: 80, y: 80, size: 25, speed: 0.6 },
    { emoji: '🍃', x: 20, y: 70, size: 22, speed: 0.9 },
    { emoji: '🌵', x: 60, y: 30, size: 28, speed: 0.7 },
    { emoji: '⏰', x: 90, y: 60, size: 24, speed: 0.8 },
    { emoji: '🔍', x: 40, y: 40, size: 26, speed: 0.6 }
]);

const bubbleStyle = (bubble) => {
    return {
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        fontSize: `${bubble.size}px`,
        animationDuration: `${15 / bubble.speed}s`
    };
};

let animationFrame;
const animateBubbles = () => {
    bubbles.value.forEach(bubble => {
        bubble.y -= bubble.speed * 0.1;
        if (bubble.y < -10) {
            bubble.y = 110;
            bubble.x = Math.random() * 100;
        }
    });
    animationFrame = requestAnimationFrame(animateBubbles);
};

onMounted(() => {
    animationFrame = requestAnimationFrame(animateBubbles);
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.hero-section {
    text-align: center;
    padding: 60px 0;
    margin-bottom: 40px;
    position: relative;
    z-index: 2;
}

.hero-section h1 {
    color: var(--primary-dark);
    font-size: 2.8em;
    margin-bottom: 15px;
    animation: fadeInDown 1s ease;
}

.subtitle {
    font-size: 1.3em;
    color: var(--text-secondary);
    margin-bottom: 30px;
    animation: fadeInUp 1s ease;
}

.cta-buttons {
    margin-top: 30px;
    animation: fadeIn 1.2s ease;
}

.cta-button {
    padding: 15px 30px;
    font-size: 18px;
    transition: all 0.3s ease;
}

.cta-button:hover {
    transform: scale(1.05);
}

.features-section {
    margin-bottom: 60px;
    position: relative;
    z-index: 2;
}

.feature-card {
    height: 100%;
    transition: transform 0.4s, box-shadow 0.4s;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: var(--border-radius-large) !important;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.feature-card:hover {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 15px 30px rgba(87, 188, 144, 0.2) !important;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
}

.card-header h3 {
    margin: 0;
    color: var(--primary-color);
    font-size: 1.5em;
}

.emoji {
    font-size: 1.1em;
    display: inline-block;
    transition: transform 0.3s ease;
}

.feature-card:hover .emoji {
    transform: scale(1.2);
}

.card-icon {
    font-size: 40px;
    margin-top: 20px;
    text-align: center;
    transition: transform 0.5s ease;
}

.feature-card:hover .card-icon {
    transform: rotate(15deg) scale(1.2);
}

/* 漂浮气泡样式 */
.time-bubbles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
}

.bubble {
    position: absolute;
    opacity: 0.4;
    animation: float linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

@keyframes float {
    0% {
        transform: translateY(0) rotate(0deg);
    }

    50% {
        transform: translateY(-30px) rotate(10deg);
    }

    100% {
        transform: translateY(-60px) rotate(0deg);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>