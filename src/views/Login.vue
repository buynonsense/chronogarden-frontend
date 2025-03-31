<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <h2>登录</h2>
            </template>
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef" @submit.prevent="handleLogin">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock"
                        @keyup.enter="handleLogin" />
                </el-form-item>

                <!-- 验证码区域 - 尝试错误三次后显示 -->
                <el-form-item v-if="failedAttempts >= 3" prop="captcha">
                    <div class="captcha-container">
                        <el-input v-model="loginForm.captcha" placeholder="请输入验证码" ref="captchaInputRef"
                            @keyup.enter="handleLogin" />
                        <div class="captcha-image" @click="refreshCaptcha" v-html="captchaHTML"></div>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleLogin" :loading="loading"
                        class="login-button">登录</el-button>
                </el-form-item>
                <div class="login-footer">
                    <span>没有账号？</span>
                    <router-link to="/register">立即注册</router-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '../store/user'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const redirectPath = ref('')
const failedAttempts = ref(parseInt(sessionStorage.getItem('loginFailedAttempts') || '0'))
const captchaText = ref(generateCaptchaText())
const captchaColors = ['#4e73df', '#36b9cc', '#1cc88a', '#f6c23e', '#e74a3b']
const captchaInputRef = ref(null)

const loginForm = reactive({
    username: '',
    password: '',
    captcha: ''
})

// 验证规则
const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    captcha: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (failedAttempts.value >= 3 && value.toLowerCase() !== captchaText.value.toLowerCase()) {
                    callback(new Error('验证码错误'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 生成验证码HTML
const captchaHTML = computed(() => {
    let html = ''
    for (let i = 0; i < captchaText.value.length; i++) {
        const color = captchaColors[Math.floor(Math.random() * captchaColors.length)]
        const rotation = Math.random() * 30 - 15
        html += `<span style="color: ${color}; transform: rotate(${rotation}deg) translateY(${Math.random() * 6 - 3}px); 
                display: inline-block;">${captchaText.value[i]}</span>`
    }
    return html
})

// 生成随机验证码文本
function generateCaptchaText(length = 4) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

// 刷新验证码
function refreshCaptcha() {
    captchaText.value = generateCaptchaText()
    // 清空验证码输入框
    loginForm.captcha = ''

    // 延迟聚焦到验证码输入框，确保DOM更新后进行
    setTimeout(() => {
        if (captchaInputRef.value) {
            captchaInputRef.value.focus()
        }
    }, 50)
}

// 获取重定向路径
onMounted(() => {
    redirectPath.value = route.query.redirect || '/dashboard'
})

// 记录失败尝试次数
function incrementFailedAttempts() {
    failedAttempts.value++
    sessionStorage.setItem('loginFailedAttempts', failedAttempts.value.toString())
    if (failedAttempts.value === 3) {
        refreshCaptcha()
    }
}

// 重置失败尝试次数
function resetFailedAttempts() {
    failedAttempts.value = 0
    sessionStorage.removeItem('loginFailedAttempts')
}

const handleLogin = async () => {
    if (!loginFormRef.value) return

    await loginFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true

                // 验证码检查
                if (failedAttempts.value >= 3) {
                    if (loginForm.captcha.toLowerCase() !== captchaText.value.toLowerCase()) {
                        ElMessage.error('验证码错误')
                        refreshCaptcha()
                        loading.value = false
                        return
                    }
                }

                await userStore.login(loginForm)
                ElMessage.success('登录成功')

                // 登录成功后重置失败次数
                resetFailedAttempts()

                // 登录成功后重定向到之前的页面
                router.replace(redirectPath.value)
            } catch (error) {
                console.error(error)

                // 简化错误消息处理
                ElMessage.error('账号或密码错误')

                // 增加失败计数
                incrementFailedAttempts()

                // 刷新验证码
                if (failedAttempts.value >= 3) {
                    refreshCaptcha() // 这里会清空验证码输入框并聚焦
                }
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 120px);
}

.login-card {
    width: 400px;
}

.login-button {
    width: 100%;
}

.login-footer {
    text-align: center;
    margin-top: 15px;
}

.captcha-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.captcha-image {
    min-width: 100px;
    height: 40px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    user-select: none;
    letter-spacing: 2px;
    font-weight: bold;
    position: relative;
}

.captcha-image::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(45deg,
            rgba(0, 0, 0, 0.02),
            rgba(0, 0, 0, 0.02) 10px,
            rgba(0, 0, 0, 0) 10px,
            rgba(0, 0, 0, 0) 20px);
}

.captcha-image::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: rgba(0, 0, 0, 0.2);
    top: 50%;
    left: 0;
    transform: translateY(-50%) rotate(var(--rotation, -2deg));
    --rotation: calc(Math.random() * 6 - 3deg);
}
</style>