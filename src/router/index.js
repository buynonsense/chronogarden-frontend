import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Plants from '../views/Plants.vue'
import PlantDetail from '../views/PlantDetail.vue'
import Eras from '../views/Eras.vue'
import CareRecords from '../views/CareRecords.vue'
import NotAuthorized from '../views/NotAuthorized.vue'  // 添加未授权页面

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guestOnly: true } // 只允许未登录用户访问
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { guestOnly: true } // 只允许未登录用户访问
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/plants',
        name: 'Plants',
        component: Plants,
        meta: { requiresAuth: true } // 添加权限控制
    },
    {
        path: '/plant/:id',
        name: 'PlantDetail',
        component: PlantDetail,
        meta: { requiresAuth: true } // 添加权限控制
    },
    {
        path: '/eras',
        name: 'Eras',
        component: Eras,
        meta: { requiresAuth: true } // 添加权限控制
    },
    {
        path: '/timenodes',
        redirect: '/eras'
    },
    {
        path: '/care-records',
        name: 'CareRecords',
        component: CareRecords,
        meta: { requiresAuth: true }
    },
    {
        path: '/not-authorized',
        name: 'NotAuthorized',
        component: NotAuthorized
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 增强的路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const isAuthenticated = !!token

    // 需要登录但未登录 - 重定向到登录页
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath } // 保存原目标路径
        })
        return
    }

    // 只允许未登录用户访问的页面，但用户已登录 - 重定向到首页
    if (to.meta.guestOnly && isAuthenticated) {
        next('/dashboard')
        return
    }

    next()
})

export default router