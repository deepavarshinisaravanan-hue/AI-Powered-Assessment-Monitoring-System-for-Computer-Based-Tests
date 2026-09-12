import api from "./api"

const USE_MOCK = false

export const monitoringService = {
  async getLiveStudents() {
    const { data } = await api.get("/monitoring/")
    return {
      students: data.map((session) => ({
        id: session.id,
        name: `Student ${session.student_id}`,
        rollNo: `ST-${session.student_id}`,
        department: "Computer Science",
        status: session.status === "active" ? "Active" : "Idle",
        violations: 0,
        risk: "Low",
      })),
    }
  },

  async analyzeFrame() {
    return { face: true, phone: false, multiplePersons: false }
  },
}
