import api from "./api"
import { mockUsers } from "../mock/users"
import { delay, uid } from "../utils"

const USE_MOCK = true

export const authService = {
  async login({ email, password, role }) {
    if (USE_MOCK) {
      await delay(700)
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password && u.role === role
      )
      if (!user) throw new Error("Invalid credentials for the selected role")
      const { password: _pw, ...safe } = user
      return { user: safe, token: `mock.${uid("tok")}` }
    }
    const { data } = await api.post("/auth/login", { email, password, role })
    return data
  },

  async logout() {
    if (USE_MOCK) {
      await delay(200)
      return { success: true }
    }
    const { data } = await api.post("/auth/logout")
    return data
  },

  async updateProfile(payload) {
    if (USE_MOCK) {
      await delay(500)
      return { user: payload }
    }
    const { data } = await api.put("/auth/profile", payload)
    return data
  },
}
