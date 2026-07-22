import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "../../components/common/PageHeader"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Checkbox from "../../components/forms/Checkbox"
import Badge from "../../components/ui/Badge"
import { mockExam } from "../../mock/questions"
import {
  FiCamera,
  FiMaximize,
  FiWifi,
  FiMic,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlay,
} from "react-icons/fi"
import toast from "react-hot-toast"

export default function ExamInstructions() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const systemChecks = [
    {
      id: "webcam",
      label: "Webcam Requirement",
      desc: "Live camera stream enabled for continuous face verification.",
      icon: FiCamera,
      status: "Ready",
    },
    {
      id: "fullscreen",
      label: "Fullscreen Requirement",
      desc: "Exam browser must lock into fullscreen mode throughout.",
      icon: FiMaximize,
      status: "Ready",
    },
    {
      id: "internet",
      label: "Internet Connection",
      desc: "High-speed stable connection for real-time telemetry syncing.",
      icon: FiWifi,
      status: "Ready",
    },
    {
      id: "microphone",
      label: "Microphone Requirement",
      desc: "Audio channel monitoring enabled for ambient noise checks.",
      icon: FiMic,
      status: "Ready",
    },
  ]

  const handleStartExam = () => {
    if (!accepted) {
      toast.error("Please review and accept the integrity notice to proceed.")
      return
    }
    setLoading(true)
    toast.success("Initializing anti-cheat proctoring session...")
    setTimeout(() => {
      setLoading(false)
      navigate("/student/exam")
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Assessment Instructions & Rules"
        description="Please complete system readiness verification and review proctoring rules before starting."
      />

      {/* System Readiness Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <FiShield className="text-primary" /> Readiness Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemChecks.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="flex items-start gap-3.5 p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                    <Badge variant="success" dot className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Rules & Guidelines */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FiCheckCircle className="text-success" /> Proctored Rules & Guidelines
        </h3>

        <ul className="space-y-3 text-sm text-foreground">
          {mockExam.instructions.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {idx + 1}
              </span>
              <span className="text-xs md:text-sm text-foreground/90">{rule}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Academic Integrity Notice & Acceptance */}
      <Card className="p-6 border-warning/40 bg-warning/5 space-y-4">
        <div className="flex items-start gap-3">
          <FiAlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Academic Integrity Pledge
            </h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              By launching this examination, you affirm that all work submitted will be entirely your own.
              Any unauthorized assistance, tab switching, multiple person detection, or screen exiting will be automatically logged and flagged for administrative review.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-warning/20">
          <Checkbox
            label="I have read, understood, and agree to adhere strictly to the examination rules and proctoring policy."
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
        </div>
      </Card>

      {/* Action CTA */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => navigate("/student/dashboard")}
        >
          Return to Dashboard
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={FiPlay}
          loading={loading}
          disabled={!accepted}
          onClick={handleStartExam}
        >
          Start Assessment Now
        </Button>
      </div>
    </div>
  )
}
