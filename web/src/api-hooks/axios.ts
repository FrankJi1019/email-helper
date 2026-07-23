import axios from 'axios'
import { useAuth } from '../providers/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { Routes } from '../routes/routes'

export const useHttpClient = () => {

  const { getAccessToken } = useAuth()
  const navigate = useNavigate()

  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
  })

  apiClient.interceptors.request.use(async (config) => {
    const token = await getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        navigate(Routes.LOGIN.path)
      }
      return Promise.reject(error)
    }
  )

  return apiClient
}