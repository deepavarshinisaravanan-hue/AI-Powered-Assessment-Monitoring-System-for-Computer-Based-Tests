import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi"
import api from "../../services/api"
import PageHeader from "../../components/common/PageHeader"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Input from "../../components/forms/Input"
import Textarea from "../../components/forms/Textarea"
import Loader from "../../components/ui/Loader"

const emptyQuestion = () => ({ text: "", options: ["", "", "", ""], correct: "A" })

export default function CreateAssessmentPage() {
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("60")
  const [assigned, setAssigned] = useState([])
  const [questions, setQuestions] = useState([emptyQuestion()])

  useEffect(() => {
    api.get("/students/")
      .then(({ data }) => setStudents(data))
      .catch((error) => toast.error(error.message || "Could not load students"))
      .finally(() => setLoadingStudents(false))
  }, [])

  const updateQuestion = (index, updates) => {
    setQuestions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item))
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((items) => items.map((item, index) => index === questionIndex
      ? { ...item, options: item.options.map((option, i) => i === optionIndex ? value : option) }
      : item))
  }

  const toggleStudent = (id) => setAssigned((items) => items.includes(id)
    ? items.filter((item) => item !== id)
    : [...items, id])

  const save = async (event) => {
    event.preventDefault()
    if (!title.trim() || !Number.isInteger(Number(duration)) || Number(duration) < 1) {
      toast.error("Enter an exam title and a positive whole-number duration.")
      return
    }
    if (!assigned.length) {
      toast.error("Assign this assessment to at least one student.")
      return
    }
    if (questions.some((question) => !question.text.trim() || question.options.some((option) => !option.trim()))) {
      toast.error("Complete each question and all four answer options.")
      return
    }

    setSaving(true)
    try {
      await api.post("/exams/", {
        title: title.trim(),
        description: description.trim() || null,
        duration_minutes: Number(duration),
        student_ids: assigned,
        questions: questions.map((question) => ({
          question_text: question.text.trim(),
          option_a: question.options[0].trim(),
          option_b: question.options[1].trim(),
          option_c: question.options[2].trim(),
          option_d: question.options[3].trim(),
          correct_option: question.correct,
          difficulty: "medium",
        })),
      })
      toast.success("Assessment created and published for assigned students.")
      setTitle("")
      setDescription("")
      setDuration("60")
      setAssigned([])
      setQuestions([emptyQuestion()])
    } catch (error) {
      toast.error(error.message || "Assessment could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  if (loadingStudents) return <Loader label="Loading students..." />

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="Create Assessment" description="Build a multiple choice assessment and assign it to students." />

      <Card className="space-y-5 p-5 lg:p-6">
        <h2 className="text-lg font-bold text-foreground">Assessment details</h2>
        <Input label="Exam title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={255} placeholder="e.g. Mathematics Midterm" />
        <Textarea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Instructions or details for students" />
        <Input label="Duration (minutes)" type="number" min="1" step="1" value={duration} onChange={(event) => setDuration(event.target.value)} required />
      </Card>

      <Card className="p-5 lg:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold text-foreground">Assign students</h2><p className="text-sm text-muted">Only selected students can take this assessment.</p></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setAssigned(assigned.length === students.length ? [] : students.map((student) => student.id))}>
            {assigned.length === students.length ? "Clear selection" : "Select all"}
          </Button>
        </div>
        {students.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm">
            <input type="checkbox" checked={assigned.includes(student.id)} onChange={() => toggleStudent(student.id)} className="h-4 w-4 accent-primary" />
            <span><span className="block font-semibold text-foreground">{student.name}</span><span className="text-xs text-muted">{student.email}</span></span>
          </label>)}
        </div> : <p className="text-sm text-muted">No student accounts are available to assign.</p>}
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold text-foreground">Questions</h2><p className="text-sm text-muted">Each question has four options and one correct answer.</p></div>
          <Button type="button" variant="outline" icon={FiPlus} onClick={() => setQuestions((items) => [...items, emptyQuestion()])}>Add question</Button>
        </div>
        {questions.map((question, index) => <Card key={index} className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Question {index + 1}</h3>
            <Button type="button" variant="ghost" size="sm" icon={FiTrash2} disabled={questions.length === 1} onClick={() => setQuestions((items) => items.filter((_, i) => i !== index))}>Remove</Button>
          </div>
          <Textarea label="Question" value={question.text} onChange={(event) => updateQuestion(index, { text: event.target.value })} rows={2} required />
          <div className="grid gap-4 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => <Input key={optionIndex} label={`Option ${String.fromCharCode(65 + optionIndex)}`} value={option} onChange={(event) => updateOption(index, optionIndex, event.target.value)} required maxLength={255} />)}
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Correct answer</legend>
            <div className="flex flex-wrap gap-3">{question.options.map((_, optionIndex) => {
              const letter = String.fromCharCode(65 + optionIndex)
              return <label key={letter} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <input type="radio" name={`correct-${index}`} value={letter} checked={question.correct === letter} onChange={() => updateQuestion(index, { correct: letter })} className="accent-primary" />
                {letter}
              </label>
            })}</div>
          </fieldset>
        </Card>)}
      </div>

      <div className="flex justify-end"><Button type="submit" variant="primary" icon={FiSave} loading={saving} disabled={!students.length}>Create and publish assessment</Button></div>
    </form>
  )
}
