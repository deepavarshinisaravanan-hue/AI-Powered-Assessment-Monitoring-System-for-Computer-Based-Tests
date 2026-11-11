import api from "./api"

export const examService = {
  async getExam(examId) {
    const { data } = await api.get("/exam/current", { params: examId ? { exam_id: examId } : {} })
    if (!data.exam) throw new Error("No assigned assessment is available.")
    const exam = data.exam
    const questions = data.questions.map((q) => ({
      id: q.id,
      text: q.question_text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      difficulty: q.difficulty,
    }))
    return { exam, questions }
  },

  async submitExam(payload) {
    if (!payload.exam_id || !payload.student_id) {
      throw new Error("Exam and student IDs are required to submit answers.")
    }

    const answers = Object.entries(payload.answers || {}).map(([question_id, selectedIndex]) => ({
      question_id: Number(question_id),
      selected_option: String.fromCharCode(65 + Number(selectedIndex)),
    }))

    const { data } = await api.post("/exam/submit", {
      exam_id: payload.exam_id,
      student_id: payload.student_id,
      answers,
    })
    if (data?.success !== true || !Number.isFinite(Number(data.score)) || !Number.isFinite(Number(data.total_questions))) {
      throw new Error(data?.detail || "The server did not confirm that the assessment was saved.")
    }
    return data
  },
}
