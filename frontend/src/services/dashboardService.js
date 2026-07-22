import api from "./api"
import {
  dashboardStats,
  violationSummary,
  performanceData,
  weeklyExams,
  recentActivities,
  previousAttempts,
  performanceTrend,
  notifications,
} from "../mock/data"
import { delay } from "../utils"

const USE_MOCK = true

export const dashboardService = {
  async getAdminStats() {
    if (USE_MOCK) {
      await delay(500)
      return { stats: dashboardStats, violationSummary, performanceData, weeklyExams, recentActivities }
    }
    const { data } = await api.get("/dashboard/admin")
    return data
  },

  async getStudentDashboard() {
    if (USE_MOCK) {
      await delay(500)
      return { previousAttempts, performanceTrend, notifications, recentActivities }
    }
    const { data } = await api.get("/dashboard/student")
    return data
  },
}
