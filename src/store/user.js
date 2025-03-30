import { defineStore } from 'pinia'
import { login, register } from '../api/auth'

// 不要直接导入router，让调用者决定重定向
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
                return response
            } catch (error) {
                throw error
            }
        },

        async register(userData) {
            try {
                const response = await register(userData)
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
        }
    }
})