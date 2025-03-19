<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <h2>登录</h2>
            </template>
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
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
import { ref, reactive } from 'vue'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
    username: '',
    password: ''
})

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
    if (!loginFormRef.value) return

    await loginFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                await userStore.login(loginForm)
                ElMessage.success('登录成功')
            } catch (error) {
                console.error(error)
                ElMessage.error('登录失败：' + (error.response?.data || '未知错误'))
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
</style>