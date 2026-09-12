import { createContext, useContext, useState, useCallback } from "react"
import { examService } from "../services/examService"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"

const ExamContext = createContext(null)

export function ExamProvider({ children }) {
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [marked, setMarked] = useState({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(() => storage(STORAGE_KEYS.EXAM_STATE).get()?.result || null)

  const loadExam = useCallback(async () => {
    setLoading(true)
    try {
      const { exam: e, questions: q } = await examService.getExam()
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

  const computeResult = useCallback(
    (violationCount = 0, timeTakenSec = 0) => {
      let correct = 0
      questions.forEach((q) => {
        if (answers[q.id] === q.answer) correct++
      })
      const total = questions.length
      const incorrect = total - correct
      const percentage = total ? Math.round((correct / total) * 100) : 0
      const risk = violationCount >= 6 ? "High" : violationCount >= 3 ? "Medium" : "Low"
      const res = {
        score: correct * 2,
        totalMarks: total * 2,
        correct,
        incorrect,
        total,
        percentage,
        risk,
        violations: violationCount,
        timeTaken: timeTakenSec,
        submittedAt: new Date().toISOString(),
      }
      return res
    },
    [answers, questions]
  )

  const submitExam = useCallback(
    async (violationCount = 0, timeTakenSec = 0) => {
      const res = computeResult(violationCount, timeTakenSec)
      const auth = storage(STORAGE_KEYS.AUTH).get()
      await examService.submitExam({
        exam_id: exam?.id ?? 1,
        student_id: auth?.user?.id,
        answers,
        result: res,
      })
      setResult(res)
      storage(STORAGE_KEYS.EXAM_STATE).set({ result: res })
      return res
    },
    [answers, computeResult, exam]
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
