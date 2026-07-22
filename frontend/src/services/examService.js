import api from "./api"
import { mockExam, mockQuestions } from "../mock/questions"
import { delay } from "../utils"

const USE_MOCK = true

export const examService = {
  async getExam() {
    if (USE_MOCK) {
      await delay(500)
      return { exam: mockExam, questions: mockQuestions }
    }
    const { data } = await api.get("/exam/current")
    return data
  },

  async submitExam(payload) {
    if (USE_MOCK) {
      await delay(900)
      return { success: true, resultId: "res-" + Date.now() }
    }
    const { data } = await api.post("/exam/submit", payload)
    return data
  },
}
