import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useExam } from "../../context/ExamContext"
import { useMonitoring } from "../../context/MonitoringContext"
import { useFullscreen } from "../../hooks/useFullscreen"
import { useAntiCheat } from "../../hooks/useAntiCheat"
import { useTimer } from "../../hooks/useTimer"
import WebcamFeed from "../../components/monitoring/WebcamFeed"
import MonitoringStatus from "../../components/monitoring/MonitoringStatus"
import ViolationAlert from "../../components/monitoring/ViolationAlert"
import ViolationList from "../../components/monitoring/ViolationList"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import Progress from "../../components/ui/Progress"
import Modal from "../../components/ui/Modal"
import { formatTime } from "../../utils"
import {
  FiClock,
  FiMaximize,
  FiAlertTriangle,
  FiBookmark,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiUser,
  FiShield,
} from "react-icons/fi"
import toast from "react-hot-toast"

export default function ExaminationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    exam,
    questions,
    answers,
    marked,
    current,
    loadExam,
    selectAnswer,
    toggleMark,
    goTo,
    submitExam,
    answeredCount,
  } = useExam()

  const { status, violations, violationCount, logViolation, updateStatus } = useMonitoring()

  const [activeViolation, setActiveViolation] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fullscreen hook
  const handleFullscreenExit = useCallback(() => {
    logViolation("fullscreen")
    updateStatus({ fullscreen: false })
  }, [logViolation, updateStatus])

  const { isFullscreen, enter: enterFullscreen } = useFullscreen(handleFullscreenExit)

  // Anti-cheat hook
  useAntiCheat(true, (typeKey) => {
    logViolation(typeKey)
    if (typeKey === "tab") updateStatus({ browser: false })
    const meta = {
      phone: { label: "Mobile phone detected near candidate", severity: "high" },
      multiface: { label: "Multiple persons detected in camera frame", severity: "high" },
      fullscreen: { label: "Candidate exited required fullscreen mode", severity: "medium" },
      tab: { label: "Browser tab change / focus lost detected", severity: "medium" },
      noface: { label: "Candidate face not detected in webcam feed", severity: "medium" },
      rightclick: { label: "Right-click context menu prohibited", severity: "low" },
      copy: { label: "Copying text content is disabled", severity: "low" },
      paste: { label: "Pasting text content is disabled", severity: "low" },
    }[typeKey] || { label: "Security violation recorded", severity: "medium" }

    setActiveViolation({ ...meta, time: new Date().toISOString() })
  })

  // Timer hook (30 minutes default)
  const handleTimerExpire = useCallback(async () => {
    toast.error("Time expired! Automatically submitting your assessment.")
    setSubmitting(true)
    const result = await submitExam(violationCount, 1800)
    navigate("/student/result", { state: { result } })
  }, [submitExam, violationCount, navigate])

  const { seconds: timeLeft } = useTimer(1800, handleTimerExpire)

  // Auto load exam data & request fullscreen on mount
  useEffect(() => {
    loadExam()
    enterFullscreen()
  }, [loadExam, enterFullscreen])

  // Periodic AI Proctored simulation trigger
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random()
      if (rand < 0.05) {
        logViolation("noface")
        updateStatus({ face: false })
        setTimeout(() => updateStatus({ face: true }), 3000)
      } else if (rand < 0.08 && rand >= 0.05) {
        logViolation("phone")
        updateStatus({ phone: true })
        setTimeout(() => updateStatus({ phone: false }), 4000)
      }
    }, 12000)
    return () => clearInterval(interval)
  }, [logViolation, updateStatus])

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    setShowConfirm(false)
    const timeSpentSec = 1800 - timeLeft
    const res = await submitExam(violationCount, timeSpentSec)
    toast.success("Assessment submitted successfully!")
    navigate("/student/result", { state: { result: res } })
  }

  if (!questions || !questions.length) {
    return <div className="p-8 text-center text-muted">Loading exam workspace...</div>
  }

  const currentQ = questions[current]
  const isCurrentMarked = !!marked[currentQ?.id]
  const selectedOption = answers[currentQ?.id]

  return (
    <div className="space-y-4">
      {/* Real-time Violation Toast Banner */}
      <ViolationAlert
        violation={activeViolation}
        onDismiss={() => setActiveViolation(null)}
      />

      {/* Top Examination Control Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FiUser className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{user?.name || "Candidate"}</h2>
            <p className="text-xs text-muted font-mono">{exam?.title || "DSA — Mid Semester"}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-mono text-sm font-bold">
            <FiClock className="w-4 h-4 text-primary animate-pulse" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>

          <Badge
            variant={isFullscreen ? "success" : "warning"}
            className="cursor-pointer"
            onClick={enterFullscreen}
          >
            <FiMaximize className="inline mr-1" />
            {isFullscreen ? "Fullscreen Mode" : "Click to Re-enter Fullscreen"}
          </Badge>

          <Badge variant={violationCount > 3 ? "danger" : "info"} dot>
            <FiAlertTriangle className="inline mr-1" />
            {violationCount} Violations Logged
          </Badge>

          <Button
            variant="danger"
            size="sm"
            icon={FiSend}
            onClick={() => setShowConfirm(true)}
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Monitoring Status Indicator Bar */}
      <MonitoringStatus status={status} />

      {/* Main Examination Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Area (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-xs font-mono text-muted uppercase tracking-wider">
                  Question {current + 1} of {questions.length}
                </span>
                <Progress
                  value={((current + 1) / questions.length) * 100}
                  className="h-1.5 w-48 mt-2"
                />
              </div>

              <Button
                variant={isCurrentMarked ? "warning" : "outline"}
                size="sm"
                icon={FiBookmark}
                onClick={() => toggleMark(currentQ.id)}
              >
                {isCurrentMarked ? "Marked for Review" : "Mark for Review"}
              </Button>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
                {currentQ.text}
              </h3>

              {/* MCQ Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((optionText, idx) => {
                  const isSelected = selectedOption === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectAnswer(currentQ.id, idx)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-soft"
                          : "border-border/80 bg-card hover:bg-muted/10 text-foreground/90"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-muted/20 text-muted border border-border"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium pt-0.5">{optionText}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <Button
                variant="outline"
                size="sm"
                icon={FiChevronLeft}
                disabled={current === 0}
                onClick={() => goTo(current - 1)}
              >
                Previous
              </Button>

              <span className="text-xs text-muted font-mono">
                {answeredCount} of {questions.length} Answered
              </span>

              {current < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => goTo(current + 1)}
                >
                  Next <FiChevronRight className="ml-1 inline" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  icon={FiCheckCircle}
                  onClick={() => setShowConfirm(true)}
                >
                  Finish Exam
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side Monitoring & Question Palette Panel */}
        <div className="space-y-6">
          {/* Live Proctor Webcam Stream */}
          <WebcamFeed isMonitoring={true} />

          {/* Question Navigation Palette */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs font-mono font-normal text-muted">
                {answeredCount}/{questions.length} Answered
              </span>
            </h4>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, idx) => {
                const isAns = answers[q.id] !== undefined
                const isMrk = marked[q.id]
                const isCurr = idx === current

                let bgClass = "bg-muted/10 text-muted border-border"
                if (isAns) bgClass = "bg-success text-white border-success"
                if (isMrk) bgClass = "bg-warning text-dark border-warning"
                if (isAns && isMrk) bgClass = "bg-warning text-dark ring-2 ring-success"

                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(idx)}
                    className={`h-9 w-full rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-center ${bgClass} ${
                      isCurr ? "ring-2 ring-primary ring-offset-2 scale-105" : "hover:opacity-80"
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted pt-2 border-t border-border/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" /> Review
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted inline-block" /> Unanswered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Current
              </span>
            </div>
          </Card>

          {/* Live Anti-Cheat Log Stream */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiShield className="text-danger" /> Live Security Log
              </span>
              <Badge variant="outline" className="text-[10px]">
                {violations.length} logged
              </Badge>
            </h4>
            <ViolationList violations={violations} />
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Submit Examination?"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to submit your assessment? Once submitted, you will not be able to modify your answers.
          </p>

          <div className="p-4 rounded-xl bg-muted/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Total Questions:</span>
              <span className="font-bold text-foreground">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Answered:</span>
              <span className="font-bold text-success">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Unanswered:</span>
              <span className="font-bold text-warning">{questions.length - answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Logged Violations:</span>
              <span className={`font-bold ${violationCount > 3 ? "text-danger" : "text-foreground"}`}>
                {violationCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel & Continue Exam
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              icon={FiSend}
              onClick={handleFinalSubmit}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
