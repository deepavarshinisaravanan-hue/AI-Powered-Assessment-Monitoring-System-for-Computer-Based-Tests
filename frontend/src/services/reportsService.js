import api from "./api"
import { mockReports } from "../mock/data"
import { delay } from "../utils"

const USE_MOCK = true

export const reportsService = {
  async getReports() {
    if (USE_MOCK) {
      await delay(500)
      return { reports: mockReports }
    }
    const { data } = await api.get("/reports")
    return data
  },

  async exportReports() {
    if (USE_MOCK) {
      await delay(600)
      return { success: true }
    }
    const { data } = await api.get("/reports/export", { responseType: "blob" })
    return data
  },
}
