import api from "./api"

const USE_MOCK = false

export const authService = {
  async login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password })
    const user = {
      id: data.user_id,
      email,
      role: data.role,
      name: data.role === "admin" ? "Admin User" : "Student User",
      is_active: true,
    }
    return { user, token: data.access_token }
  },

  async logout() {
    return { success: true }
  },

  async updateProfile(payload) {
    return { user: payload }
  },
}
