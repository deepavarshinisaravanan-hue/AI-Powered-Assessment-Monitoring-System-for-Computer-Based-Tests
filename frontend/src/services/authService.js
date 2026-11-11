import api from "./api"

const USE_MOCK = false

export const authService = {
  async register({ name, email, password }) {
    const { data } = await api.post("/auth/register", { name, email, password })
    return data
  },

  async login({ email, password }) {
    const { data } = await api.post("/auth/login", { email, password })
    const token = data.access_token
    const { data: user } = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    return { user, token }
  },

  async logout() {
    return { success: true }
  },

  async updateProfile(payload) {
    return { user: payload }
  },
}
