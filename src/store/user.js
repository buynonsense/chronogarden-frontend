import { defineStore } from 'pinia'
import { login, register } from '../api/auth'
import router from '../router'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        username: localStorage.getItem('username') || '',
        isAuthenticated: !!localStorage.getItem('token')
    }),

    actions: {
        async login(userData) {
            try {
                const response = await login(userData)
                this.setUserData(response.data, userData.username)
                router.push('/dashboard')
                return response
            } catch (error) {
                throw error
            }
        },

        async register(userData) {
            try {
                const response = await register(userData)
                router.push('/login')
                return response
            } catch (error) {
                throw error
            }
        },

        setUserData(token, username) {
            this.token = token
            this.username = username
            this.isAuthenticated = true
            localStorage.setItem('token', token)
            localStorage.setItem('username', username)
        },

        logout() {
            this.token = ''
            this.username = ''
            this.isAuthenticated = false
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            router.push('/login')
        }
    }
})