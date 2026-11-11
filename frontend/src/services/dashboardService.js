import api from "./api"
import { STORAGE_KEYS } from "../constants"
import { storage, timeAgo } from "../utils"

export const dashboardService = {
  async getAdminStats() {
    const [adminDashboard, students, reports, exams] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/students/"),
      api.get("/reports/"),
      api.get("/exams/"),
    ])
    const violationResponses = await Promise.all(
      exams.data.map((exam) => api.get(`/violations/exam/${exam.id}`))
    )
    const violations = violationResponses.flatMap((response) => response.data)
    const violationGroups = violations.reduce((groups, violation) => {
      const group = groups[violation.violation_type] || {
        count: 0,
        severity: violation.severity,
      }
      groups[violation.violation_type] = { ...group, count: group.count + 1 }
      return groups
    }, {})
    const violationSummary = Object.entries(violationGroups).map(([type, group]) => ({
      label: type.replace(/_/g, " "),
      value: group.count,
      color: group.severity === "high" ? "danger" : group.severity === "medium" ? "warning" : "secondary",
    }))
    const performanceBuckets = [
      { label: "0-40%", min: 0, max: 40 },
      { label: "41-60%", min: 41, max: 60 },
      { label: "61-75%", min: 61, max: 75 },
      { label: "76-90%", min: 76, max: 90 },
      { label: "91-100%", min: 91, max: 100 },
    ]
    const performanceData = performanceBuckets.map((bucket) => ({
      label: bucket.label,
      value: reports.data.filter((report) => {
        const percentage = Number(report.percentage)
        return percentage >= bucket.min && percentage <= bucket.max
      }).length,
    }))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weeklyExams = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today)
      day.setDate(today.getDate() - 6 + index)
      const nextDay = new Date(day)
      nextDay.setDate(day.getDate() + 1)
      return {
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        value: reports.data.filter((report) => {
          const generatedAt = new Date(report.generated_at)
          return generatedAt >= day && generatedAt < nextDay
        }).length,
      }
    })
    const recentActivities = [
      ...violations.map((violation) => ({
        id: `violation-${violation.id}`,
        timestamp: violation.created_at,
        text: `Student ${violation.student_id}: ${violation.violation_type.replace(/_/g, " ")}`,
        type: violation.severity === "high" ? "danger" : "warning",
      })),
      ...reports.data.map((report) => ({
        id: `report-${report.id}`,
        timestamp: report.generated_at,
        text: `Student ${report.student_id} submitted Assessment ${report.exam_id}`,
        type: "success",
      })),
    ]
      .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
      .slice(0, 6)
      .map((activity) => ({ ...activity, time: timeAgo(activity.timestamp) }))

    return {
      stats: {
        totalStudents: students.data.length,
        runningExams: adminDashboard.data.active_monitoring_sessions,
        completedExams: reports.data.length,
        violations: violations.length,
      },
      violationSummary,
      performanceData,
      weeklyExams,
      recentActivities,
    }
  },

  async getStudentDashboard(studentId) {
    const auth = storage(STORAGE_KEYS.AUTH).get()
    const resolvedStudentId = studentId ?? auth?.user?.id
    if (!resolvedStudentId) throw new Error("A signed-in student is required.")

    const [examResponse, reportResponse] = await Promise.all([
      api.get("/exam/available"),
      api.get(`/reports/student/${resolvedStudentId}`),
    ])

    const previousAttempts = (reportResponse.data || []).map((report) => ({
      id: report.id,
      exam: `Assessment ${report.exam_id}`,
      date: new Date(report.generated_at).toLocaleDateString(),
      percentage: report.percentage,
      status: report.status,
    }))

    return {
      assessments: examResponse.data,
      currentExam: examResponse.data[0] || null,
      questionCount: examResponse.data[0]?.question_count || 0,
      previousAttempts,
    }
  },
}
