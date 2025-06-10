import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const useApi = () => {
  return {
    get: (url: string, config: AxiosRequestConfig = {}) => api.get(url, config),
    post: (url: string, data = {}, config: AxiosRequestConfig = {}) => api.post(url, data, config),
    put: (url: string, data = {}, config: AxiosRequestConfig = {}) => api.put(url, data, config),
    delete: (url: string, config: AxiosRequestConfig = {}) => api.delete(url, config)
  }
} 