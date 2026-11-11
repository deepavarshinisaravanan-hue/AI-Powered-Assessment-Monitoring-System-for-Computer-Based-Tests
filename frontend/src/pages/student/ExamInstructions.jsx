import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSearchParams } from "react-router-dom"
import { useExam } from "../../context/ExamContext"
import { useMonitoring } from "../../context/MonitoringContext"
import PageHeader from "../../components/common/PageHeader"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Checkbox from "../../components/forms/Checkbox"
import Badge from "../../components/ui/Badge"
import { mockExam } from "../../mock/questions"
import { getScreenShareUnavailableReason } from "../../utils/screenShare"
import {
  FiMaximize,
  FiWifi,
  FiShield,
  FiCamera,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlay,
} from "react-icons/fi"
import toast from "react-hot-toast"

export default function ExamInstructions() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const examId = searchParams.get("exam_id")
  const { resetExam } = useExam()
  const { resetMonitoring } = useMonitoring()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const systemChecks = [
    {
      id: "screen-share",
      label: "Screen Sharing Requirement",
      desc: "Your entire screen must be shared throughout the examination.",
      icon: FiShield,
      status: "Required",
    },
    {
      id: "camera-monitoring",
      label: "Camera Monitoring Requirement",
      desc: "Your camera must remain enabled throughout the examination.",
      icon: FiCamera,
      status: "Required",
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
  ]

  const handleStartExam = async () => {
    if (!accepted) {
      toast.error("Please review and accept the integrity notice to proceed.")
      return
    }

    const screenShareIssue = getScreenShareUnavailableReason()
    if (screenShareIssue) {
      toast.error(screenShareIssue)
      return
    }

    const alreadyFullscreen = Boolean(document.fullscreenElement)
    if (!alreadyFullscreen && !document.documentElement.requestFullscreen) {
      toast.error("Fullscreen mode is not supported by this browser.")
      return
    }

    try {
      setLoading(true)
      const fullscreenRequest = alreadyFullscreen
        ? Promise.resolve()
        : document.documentElement.requestFullscreen()
      const screenShareRequest = navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      })

      let stream
      try {
        ;[, stream] = await Promise.all([fullscreenRequest, screenShareRequest])
      } catch (error) {
        screenShareRequest
          .then((pendingStream) => pendingStream.getTracks().forEach((track) => track.stop()))
          .catch(() => {})
        if (!alreadyFullscreen && document.fullscreenElement) {
          await document.exitFullscreen?.()
        }
        throw error
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) {
        stream.getTracks().forEach((track) => track.stop())
        if (!alreadyFullscreen) await document.exitFullscreen?.()
        throw new Error("Screen sharing did not provide a video track.")
      }

      window.__examScreenStream = stream
      videoTrack.addEventListener("ended", () => {
        if (window.__examScreenStream === stream) window.__examScreenStream = null
      })

      resetExam()
      resetMonitoring()
      toast.success("Screen sharing enabled. Starting assessment...")
      navigate("/student/exam", { state: { examId } })
    } catch (error) {
      console.error("Exam readiness request failed:", error)
      toast.error("Fullscreen and screen sharing are required to start the examination.")
      setLoading(false)
    }
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
