import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import PlantDetail from '../views/PlantDetail.vue'
import CareRecords from '../views/CareRecords.vue'
import NotAuthorized from '../views/NotAuthorized.vue'  // 添加未授权页面
import MyGarden from '../views/MyGarden.vue'
import { useUserStore } from '../store/user' // 正确的用户存储路径

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
        component: () => import('../views/Plants.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/plant/:id',
        name: 'PlantDetail',
        component: PlantDetail,
        meta: { requiresAuth: true } // 添加权限控制
    },
    // 删除独立的Eras路由
    // 但保留重定向路由，以防有旧链接
    {
        path: '/eras',
        redirect: '/plants'
    },
    {
        path: '/timenodes',
        redirect: '/plants'
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
    },
    {
        path: '/my-garden',
        name: 'MyGarden',
        component: MyGarden,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 修改路由守卫部分，避免循环引用问题
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    // 需要登录但未登录 - 重定向到登录页
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
        next('/login');
        return;
    }

    // 只允许未登录用户访问的页面，但用户已登录 - 重定向到首页
    if (to.meta.guestOnly && userStore.isAuthenticated) {
        next('/dashboard')
        return
    }

    next()
})

export default router