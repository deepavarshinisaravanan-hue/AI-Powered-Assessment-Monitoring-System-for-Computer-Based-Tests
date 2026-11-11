import api, { API_BASE_URL } from "./api"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"

export const monitoringService = {
  async getLiveStudents() {
    const endpoint = "/monitoring/"
    const requestUrl = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin).href
    console.log("[monitoringService.getLiveStudents] entered")
    console.log("[monitoringService.getLiveStudents] API base URL:", API_BASE_URL)
    console.log("[monitoringService.getLiveStudents] request URL:", requestUrl)
    try {
      const response = await api.get(endpoint)
      const { data } = response
      console.log("[monitoringService.getLiveStudents] response status:", response.status)
      console.log("[monitoringService.getLiveStudents] response data:", data)
      if (!Array.isArray(data)) {
        throw new Error("The monitoring API returned an invalid session list.")
      }
      console.log(`[monitoringService.getLiveStudents] received ${data.length} active session(s)`)
      return {
        students: data.map((session) => ({
          id: session.id,
          studentId: session.student_id,
          examId: session.exam_id,
          startedAt: session.created_at,
          name: `Student ${session.student_id}`,
          rollNo: `ST-${session.student_id}`,
          department: "Computer Science",
          status: session.status === "active" ? "Active" : "Idle",
          risk: "Low",
        })),
      }
    } catch (error) {
      console.error("[monitoringService.getLiveStudents] caught request error:", {
        url: requestUrl,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        error,
      })
      throw error
    }
  },

  async createSession(studentId, examId) {
    const { data } = await api.post("/monitoring/", {
      student_id: studentId,
      exam_id: examId,
    })
    return data
  },

  async updateSessionStatus(sessionId, status) {
    const { data } = await api.patch(`/monitoring/${sessionId}`, null, {
      params: { status },
    })
    return data
  },

  completeSessionOnExit(sessionId) {
    const token = storage(STORAGE_KEYS.AUTH).get()?.token
    if (!sessionId || !token) return

    return fetch(`${API_BASE_URL}/monitoring/${sessionId}?status=completed`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    })
  },

}
