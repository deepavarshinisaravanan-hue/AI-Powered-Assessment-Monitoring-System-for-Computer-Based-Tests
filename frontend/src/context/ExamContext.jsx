import { createContext, useContext, useState, useCallback } from "react"
import { examService } from "../services/examService"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"
import { useAuth } from "./AuthContext"

const ExamContext = createContext(null)

export function ExamProvider({ children }) {
  const { user } = useAuth()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(() => storage(STORAGE_KEYS.EXAM_STATE).get()?.result || null)

  const loadExam = useCallback(async (examId) => {
    setLoading(true)
    try {
      const { exam: e, questions: q } = await examService.getExam(examId)
      setExam(e)
      setQuestions(q)
    } finally {
      setLoading(false)
    }
  }, [])

  const selectAnswer = useCallback((qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }, [])

  const toggleMark = useCallback((qId) => {
    setMarked((prev) => ({ ...prev, [qId]: !prev[qId] }))
  }, [])

  const goTo = useCallback((idx) => setCurrent(idx), [])

  const submitExam = useCallback(
    async (violationCount = 0, timeTakenSec = 0) => {
      if (!exam?.id || !user?.id) {
        throw new Error("An active exam and signed-in student are required to submit.")
      }

      const submission = await examService.submitExam({
        exam_id: exam.id,
        student_id: user.id,
        answers,
      })
      if (submission.total_questions < 1) {
        throw new Error("The server returned an invalid assessment score. Your answers remain available.")
      }
      const correct = submission.score
      const total = submission.total_questions
      const res = {
        score: correct * 2,
        totalMarks: total * 2,
        correct,
        incorrect: total - correct,
        total,
        percentage: submission.percentage,
        risk: violationCount >= 6 ? "High" : violationCount >= 3 ? "Medium" : "Low",
        violations: violationCount,
        timeTaken: timeTakenSec,
        submittedAt: new Date().toISOString(),
        reportId: submission.report_id,
      }
      setResult(res)
      storage(STORAGE_KEYS.EXAM_STATE).set({ result: res })
      return res
    },
    [answers, exam, user]
  )

  const resetExam = useCallback(() => {
    setAnswers({})
    setMarked({})
    setCurrent(0)
    setResult(null)
    storage(STORAGE_KEYS.EXAM_STATE).remove()
  }, [])

  const answeredCount = Object.keys(answers).length

  return (
    <ExamContext.Provider
      value={{
        exam,
        questions,
        answers,
        marked,
        current,
        loading,
        result,
        answeredCount,
        loadExam,
        selectAnswer,
        toggleMark,
        goTo,
        submitExam,
        resetExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  )
}

export function useExam() {
  const ctx = useContext(ExamContext)
  if (!ctx) throw new Error("useExam must be used within ExamProvider")
  return ctx
}
