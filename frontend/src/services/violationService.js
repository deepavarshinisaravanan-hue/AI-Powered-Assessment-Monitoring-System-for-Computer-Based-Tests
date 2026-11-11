import api from "./api"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"

export const violationService = {
  async reportViolation(exam_id, violation_type, severity = "medium", description = null, studentId = null) {
    const auth = storage(STORAGE_KEYS.AUTH).get()
    const student_id = studentId ?? auth?.user?.id

    if (!Number.isInteger(student_id) || !Number.isInteger(exam_id)) {
      console.warn("Cannot report violation: missing student_id or exam_id")
      return
    }

    try {
      const { data } = await api.post("/violations/", {
        student_id,
        exam_id,
        violation_type,
        severity,
        description,
        timestamp: new Date().toISOString(),
      })
      return data
    } catch (error) {
      console.error("Failed to report violation:", error)
      // Silently fail to not disrupt exam experience
    }
  },

  async getExamViolations(exam_id) {
    try {
      const { data } = await api.get(`/violations/exam/${exam_id}`)
      return data
    } catch (error) {
      console.error("Failed to fetch exam violations:", error)
      return []
    }
  },

  async getStudentExamViolations(exam_id, student_id) {
    try {
      const { data } = await api.get(`/violations/exam/${exam_id}/student/${student_id}`)
      return data
    } catch (error) {
      console.error("Failed to fetch student exam violations:", error)
      return []
    }
  },
}
