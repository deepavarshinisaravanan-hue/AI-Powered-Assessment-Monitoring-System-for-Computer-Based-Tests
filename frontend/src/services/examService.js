import api from "./api"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"

const USE_MOCK = false

export const examService = {
  async getExam() {
    const { data } = await api.get("/exam/current")
    const exam = data.exam
    const questions = data.questions.map((q) => ({
      id: q.id,
      text: q.question_text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      answer: ["A", "B", "C", "D"].indexOf(q.correct_option),
      difficulty: q.difficulty,
    }))
    return { exam, questions }
  },

  async submitExam(payload) {
    const auth = storage(STORAGE_KEYS.AUTH).get()
    const answers = Object.entries(payload.answers || {}).map(([question_id, selectedIndex]) => ({
      question_id: Number(question_id),
      selected_option: String.fromCharCode(65 + Number(selectedIndex)),
    }))

    const { data } = await api.post("/exam/submit", {
      exam_id: payload.exam_id ?? 1,
      student_id: auth?.user?.id ?? payload.student_id,
      answers,
    })
    return data
  },
}
