import axios from 'axios'

const apiMode = import.meta.env.VITE_API_MODE || 'direct'
// In proxy mode, requests go to the same origin (Vite dev server) and Vite forwards them.
// This avoids CORS without changing the backend.
const baseURL = apiMode === 'proxy' ? '' : (import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000')

// 1. Create base instance
const api = axios.create({
  // Vite uses import.meta.env for environment variables
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const ordersBaseURL = apiMode === 'proxy'
  ? ''
  : (import.meta.env.VITE_ORDERS_API_URL || import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3001')

export const ordersApi = axios.create({
  baseURL: ordersBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 2. Response interceptor (global error handler)
api.interceptors.response.use(
  (response) => {
    // Successful response, return as is
    return response
  },
  (error) => {
    // Catch backend/network errors before they break UI flows
    console.error('Global API error:', error)

    if (error.response) {
      // Server responded with an error status code
      const status = error.response.status
      if (status === 404) {
        alert('Oops... The requested resource does not exist (404).')
      } else if (status >= 500) {
        alert('Backend server error. Please try again later (500).')
      }
    } else if (error.request) {
      // Request was sent but no response arrived (network or backend down)
      alert('Network error. Check your internet connection or verify the API Gateway is running.')
    }

    // Reject promise so caller components can handle the failure
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
