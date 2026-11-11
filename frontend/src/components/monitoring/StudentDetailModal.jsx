import { useEffect, useRef, useState } from "react"
import Modal from "../ui/Modal"
import Badge from "../ui/Badge"
import Avatar from "../ui/Avatar"
import Button from "../ui/Button"
import Card from "../ui/Card"
import { FiAlertTriangle, FiCheckCircle, FiSlash, FiShield, FiClock, FiVideo } from "react-icons/fi"
import { formatTime } from "../../utils"
import toast from "react-hot-toast"

const severityColors = {
  high: "text-danger",
  medium: "text-warning",
  low: "text-info",
}

const severityBgColors = {
  high: "bg-danger/10",
  medium: "bg-warning/10",
  low: "bg-info/10",
}

export default function StudentDetailModal({ student, isOpen, onClose, remoteStream, remoteCameraStream, cameraUnavailable }) {
  const [actionLoading, setActionLoading] = useState(false)
  const screenVideoRef = useRef(null)
  const cameraVideoRef = useRef(null)

  useEffect(() => {
    if (screenVideoRef.current && remoteStream) {
      screenVideoRef.current.srcObject = remoteStream
      screenVideoRef.current.play().catch(() => {})
    }
    if (cameraVideoRef.current && remoteCameraStream) {
      cameraVideoRef.current.srcObject = remoteCameraStream
      cameraVideoRef.current.play().catch(() => {})
    }
  }, [remoteStream, remoteCameraStream])

  if (!student) return null

  const handleTerminate = () => {
    setActionLoading(true)
    setTimeout(() => {
      setActionLoading(false)
      toast.error(`Session for ${student.name} terminated due to critical violations.`)
      onClose()
    }, 700)
  }

  const handleIssueWarning = () => {
    toast.success(`Formal warning dispatched to candidate ${student.name}.`)
  }

  const handleDismissFlags = () => {
    toast.success(`Flags cleared for ${student.name}.`)
    onClose()
  }

  const violationsList = student.violationsList || []

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Live Inspection: ${student.name}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Feed and Quick Status */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-dark rounded-2xl overflow-hidden border border-border/80 flex items-center justify-center">
              {remoteStream ? (
                <video
                  ref={screenVideoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Student Screen"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              ) : (
                <div className="text-center p-6 z-0">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <FiVideo className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-white">Waiting for Student Screen</p>
                  <p className="text-xs text-muted font-mono">{student.rollNo}</p>
                </div>
              )}

              {remoteStream && (
                <span className="absolute bottom-3 left-3 z-20 rounded bg-dark/80 px-2 py-1 text-xs text-white">
                  Student Screen
                </span>
              )}

              <div className="absolute top-3 left-3 z-20 flex gap-2">
                <Badge variant={student.status === "Flagged" ? "danger" : "success"} dot>
                  {student.status}
                </Badge>
                <span className="px-2 py-0.5 rounded bg-dark/80 backdrop-blur-md text-white text-xs font-mono border border-white/10">
                  <FiClock className="inline mr-1" />
                  {formatTime(student.timeLeft)}
                </span>
              </div>
            </div>

            {remoteCameraStream && (
              <div className="max-w-xs">
                <h4 className="mb-2 text-xs font-semibold text-foreground">Student Camera</h4>
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Student Camera"
                  className="w-full rounded-xl bg-black object-contain"
                />
              </div>
            )}
            {!remoteCameraStream && cameraUnavailable && (
              <p className="text-xs font-semibold text-danger">No Face</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 text-center">
                <span className="text-[11px] text-muted block">Screen Sharing</span>
                <span className="text-xs font-bold text-success">
                  Active
                </span>
              </Card>

              <Card className="p-3 text-center">
                <span className="text-[11px] text-muted block">Fullscreen</span>
                <span className={`text-xs font-bold ${student.fullscreen ? "text-success" : "text-warning"}`}>
                  {student.fullscreen ? "Active" : "Exited"}
                </span>
              </Card>
            </div>
          </div>

          {/* Right Column: Candidate Profile & Admin Controls */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 mb-4">
                <Avatar name={student.name} size="md" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{student.name}</h4>
                  <p className="text-xs text-muted font-mono">{student.rollNo}</p>
                  <p className="text-xs text-muted">{student.department}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted">Assessment</span>
                  <span className="font-semibold text-foreground">{student.exam}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted">Total Violations</span>
                  <span className="font-bold text-danger">{student.violations}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted">Last Activity</span>
                  <span className="font-mono text-foreground">{student.lastActivity}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="warning"
                size="sm"
                className="w-full"
                icon={FiAlertTriangle}
                onClick={handleIssueWarning}
              >
                Issue Warning
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                icon={FiCheckCircle}
                onClick={handleDismissFlags}
              >
                Clear Flagged Status
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                icon={FiSlash}
                loading={actionLoading}
                onClick={handleTerminate}
              >
                Terminate Assessment
              </Button>
            </div>
          </div>
        </div>

        {/* Violations Timeline */}
        {violationsList.length > 0 && (
          <Card className="p-4 border-t">
            <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 text-warning" />
              Recent Violations ({violationsList.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {violationsList.slice(0, 10).map((v, idx) => (
                <div key={idx} className={`text-xs p-2 rounded-lg ${severityBgColors[v.severity]}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold capitalize ${severityColors[v.severity]}`}>
                      {v.violation_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-muted font-mono text-[10px]">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {v.description && (
                    <p className="text-muted text-[10px] mt-1">{v.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  )
}

