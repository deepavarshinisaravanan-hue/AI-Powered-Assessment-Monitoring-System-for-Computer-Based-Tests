import api from "./api"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"
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

const USE_MOCK = false

export const dashboardService = {
  async getAdminStats() {
    const adminDashboard = await api.get("/admin/dashboard")
    const students = await api.get("/students")
    const reports = await api.get("/reports")

    return {
      stats: {
        totalStudents: students.data.length,
        runningExams: adminDashboard.data.active_monitoring_sessions,
        completedExams: reports.data.length,
        violations: Math.max(0, reports.data.length - 1),
      },
      violationSummary,
      performanceData,
      weeklyExams,
      recentActivities,
    }
  },

  async getStudentDashboard() {
    const auth = storage(STORAGE_KEYS.AUTH).get()
    const studentId = auth?.user?.id
    const reportData = studentId ? await api.get(`/reports/student/${studentId}`) : { data: [] }

    const previousAttempts = (reportData.data || []).map((report, index) => ({
      id: report.id,
      exam: `Assessment ${report.exam_id}`,
      date: report.generated_at,
      score: report.score,
      total: 10,
      risk: report.status === "completed" ? "Low" : "Medium",
    }))

    return {
      previousAttempts,
      performanceTrend,
      notifications,
      recentActivities,
    }
  },
}
