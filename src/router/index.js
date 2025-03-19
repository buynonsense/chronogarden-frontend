import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/timenodes',
        name: 'TimeNodes',
        component: () => import('../views/TimeNodes.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/plants',
        name: 'Plants',
        component: () => import('../views/Plants.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/plant/:id',
        name: 'PlantDetail',
        component: () => import('../views/PlantDetail.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/carerecords',
        name: 'CareRecords',
        component: () => import('../views/CareRecords.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router