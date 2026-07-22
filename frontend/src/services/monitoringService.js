import api from "./api"
import { liveStudents } from "../mock/students"
import { delay } from "../utils"

const USE_MOCK = true

export const monitoringService = {
  async getLiveStudents() {
    if (USE_MOCK) {
      await delay(500)
      return { students: liveStudents }
    }
    const { data } = await api.get("/monitoring/live")
    return data
  },

  // Simulated AI frame analysis. Replace with real socket / API events.
  async analyzeFrame() {
    if (USE_MOCK) {
      const r = Math.random()
      return {
        face: r > 0.06,
        phone: r < 0.03,
        multiplePersons: r < 0.02,
      }
    }
    const { data } = await api.post("/monitoring/analyze")
    return data
  },
}
