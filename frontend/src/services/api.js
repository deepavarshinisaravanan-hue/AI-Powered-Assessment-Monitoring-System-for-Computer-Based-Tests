import axios from "axios"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"

// Use the current origin by default so LAN clients reach the Vite /api proxy,
// rather than trying to reach their own localhost.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

// Attach auth token from localStorage on every request.
api.interceptors.request.use((config) => {
  const auth = storage(STORAGE_KEYS.AUTH).get()
  if (auth?.token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Normalize errors for the UI layer.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.detail || error?.message || "Something went wrong"
    return Promise.reject(new Error(message))
  }
)

export default api
