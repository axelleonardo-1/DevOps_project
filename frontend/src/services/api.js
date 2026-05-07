import axios from 'axios'
import { appConfig } from '@/config/app'

const api = axios.create({
  baseURL: appConfig.productsBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const ordersApi = axios.create({
  baseURL: appConfig.ordersBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Global API error:', error)

    if (error.response) {
      const status = error.response.status
      if (status === 404) {
        alert('Oops... The requested resource does not exist (404).')
      } else if (status >= 500) {
        alert('Backend server error. Please try again later (500).')
      }
    } else if (error.request) {
      alert('Network error. Check your internet connection or verify the Products API is running.')
    }

    return Promise.reject(error)
  },
)

ordersApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Global Orders API error:', error)

    if (error.response) {
      const status = error.response.status
      if (status === 404) {
        alert('Oops... The requested order resource does not exist (404).')
      } else if (status >= 500) {
        alert('Orders backend server error. Please try again later (500).')
      }
    } else if (error.request) {
      alert('Network error. Check your connection or verify the Orders API is running.')
    }

    return Promise.reject(error)
  },
)

export default api
