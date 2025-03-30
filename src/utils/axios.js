import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 请求拦截器
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 增强的响应拦截器
axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        // 未授权错误处理
        if (error.response) {
            switch (error.response.status) {
                case 401: // 未授权
                    localStorage.removeItem('token')
                    localStorage.removeItem('username')
                    
                    // 如果用户已经在登录页，不再提示
                    if (router.currentRoute.value.path !== '/login') {
                        ElMessage.error('您的登录已过期，请重新登录')
                        
                        // 使用router进行重定向，保留当前路径
                        router.replace({
                            path: '/login',
                            query: { redirect: router.currentRoute.value.fullPath }
                        })
                    }
                    break
                    
                case 403: // 禁止访问
                    ElMessage.error('您没有权限访问该资源')
                    break
                    
                case 404: // 资源不存在
                    ElMessage.error('请求的资源不存在')
                    break
                    
                case 500: // 服务器错误
                    ElMessage.error('服务器错误，请稍后再试')
                    break
                    
                default:
                    ElMessage.error(error.response.data || '请求失败')
            }
        } else {
            // 网络错误或其他非HTTP错误
            ElMessage.error('网络错误，请检查您的连接')
        }
        
        return Promise.reject(error)
    }
)

export default axios