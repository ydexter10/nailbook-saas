import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Interceptor: injeta token salvo no localStorage automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('nailbook_token')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
})

// Interceptor: se 401, limpa sessão e redireciona para login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('nailbook_token')
            delete api.defaults.headers.common['Authorization']
            // Redirecionar para login sem depender do Router
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
