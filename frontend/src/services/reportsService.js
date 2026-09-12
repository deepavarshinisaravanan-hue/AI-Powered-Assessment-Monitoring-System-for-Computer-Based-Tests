import api from "./api"

const USE_MOCK = false

export const reportsService = {
  async getReports() {
    const { data } = await api.get("/reports")
    return { reports: data }
  },

  async exportReports() {
    return { success: true }
  },
}
