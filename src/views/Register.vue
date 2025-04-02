<template>
    <div class="register-container">
        <el-card class="register-card">
            <template #header>
                <h2>注册</h2>
            </template>
            <el-form :model="registerForm" :rules="rules" ref="registerFormRef">
                <el-form-item prop="username">
                    <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                        prefix-icon="Lock" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleRegister" :loading="loading"
                        class="register-button">注册</el-button>
                </el-form-item>
                <div class="register-footer">
                    <span>已有账号？</span>
                    <router-link to="/login">立即登录</router-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useUserStore } from '../store/user';
import { useRouter } from 'vue-router'; // 添加路由导入
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter(); // 初始化router
const registerFormRef = ref(null);
const loading = ref(false);

const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: ''
});

const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'));
    } else {
        if (registerForm.confirmPassword !== '') {
            registerFormRef.value.validateField('confirmPassword');
        }
        callback();
    }
};

const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致!'));
    } else {
        callback();
    }
};

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
    ]
};

const handleRegister = async () => {
    if (!registerFormRef.value) return;

    await registerFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true;
                const userData = {
                    username: registerForm.username,
                    password: registerForm.password
                };
                await userStore.register(userData);
                ElMessage.success('注册成功，正在跳转到登录页面...');

                // 添加延时跳转，让用户能看到成功消息
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } catch (error) {
                console.error(error);
                ElMessage.error('注册失败：' + (error.response?.data || '未知错误'));
            } finally {
                loading.value = false;
            }
        }
    });
};
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 120px);
}

.register-card {
    width: 400px;
}

.register-button {
    width: 100%;
}

.register-footer {
    text-align: center;
    margin-top: 15px;
}
</style>