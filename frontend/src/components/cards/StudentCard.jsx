import { useEffect, useRef } from "react"
import { FiAlertTriangle, FiEye, FiClock, FiVideo, FiVideoOff, FiSmartphone, FiUsers } from "react-icons/fi"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import Avatar from "../ui/Avatar"
import Button from "../ui/Button"
import { formatTime } from "../../utils"

export default function StudentCard({ student, screenStream, cameraStream, cameraUnavailable, onViewDetails }) {
  const { name, rollNo, department, timeLeft, violations, face, phone, multiplePersons, status } = student
  const screenVideoRef = useRef(null)
  const cameraVideoRef = useRef(null)

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream
      screenVideoRef.current.play().catch(() => {})
    }
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream
      cameraVideoRef.current.play().catch(() => {})
    }
  }, [screenStream, cameraStream])

  const isFlagged = status === "Flagged" || violations >= 5

  return (
    <Card
      className={`relative transition-all duration-300 ${
        isFlagged
          ? "border-danger/40 bg-danger/5 shadow-md shadow-danger/5"
          : "hover:shadow-card border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={name} size="sm" status={face ? "online" : "offline"} />
          <div>
            <h4 className="text-sm font-semibold text-foreground line-clamp-1">{name}</h4>
            <p className="text-xs text-muted font-mono">{rollNo}</p>
          </div>
        </div>
        <Badge variant={isFlagged ? "danger" : "success"} dot>
          {status}
        </Badge>
      </div>

      <div className="relative aspect-video bg-dark/90 rounded-xl overflow-hidden mb-3 border border-border/40 flex items-center justify-center group">
        {screenStream ? (
          <>
            <video
              ref={screenVideoRef}
              autoPlay
              muted
              playsInline
              aria-label="Student Screen"
              className="absolute inset-0 h-full w-full object-contain"
            />
            <span className="absolute bottom-2 left-2 z-20 rounded bg-dark/80 px-2 py-1 text-[10px] text-white">
              Student Screen
            </span>
          </>
        ) : (
          <div className="text-center text-muted/60 p-4 z-0">
            <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="text-xs font-bold font-mono">LIVE</span>
            </div>
            <span className="text-[11px]">Proctor Feed</span>
          </div>
        )}

        {cameraStream && (
          <div className="absolute right-2 top-2 z-20 w-20 overflow-hidden rounded border border-white/50 bg-black">
            <video
              ref={cameraVideoRef}
              autoPlay
              muted
              playsInline
              aria-label="Student Camera"
              className="aspect-video w-full object-cover"
            />
            <span className="block bg-dark/80 px-1 py-0.5 text-center text-[8px] text-white">
              Student Camera
            </span>
          </div>
        )}

        {/* Live Indicators Overlay */}
        <div className="absolute top-2 left-2 z-20 flex gap-1.5">
          {cameraStream ? (
            <span className="px-1.5 py-0.5 rounded bg-success text-white text-[10px] font-medium flex items-center gap-1">
              <FiVideo className="w-3 h-3" /> Camera Live
            </span>
          ) : cameraUnavailable || face === false ? (
            <span className="px-1.5 py-0.5 rounded bg-danger text-white text-[10px] font-medium flex items-center gap-1">
              <FiVideoOff className="w-3 h-3" /> No Face
            </span>
          ) : null}
          {phone && (
            <span className="px-1.5 py-0.5 rounded bg-danger text-white text-[10px] font-medium flex items-center gap-1">
              <FiSmartphone className="w-3 h-3" /> Phone
            </span>
          )}
          {multiplePersons && (
            <span className="px-1.5 py-0.5 rounded bg-danger text-white text-[10px] font-medium flex items-center gap-1">
              <FiUsers className="w-3 h-3" /> Multi
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2 z-20 text-[11px] text-white/90 font-mono">
          <FiClock className="inline mr-1" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted mb-3 px-1">
        <span>{department}</span>
        <span className={`font-semibold ${violations > 3 ? "text-danger" : "text-foreground"}`}>
          <FiAlertTriangle className="inline mr-1 text-warning" />
          {violations} Violations
        </span>
      </div>

      <Button
        variant={isFlagged ? "danger" : "outline"}
        size="sm"
        className="w-full text-xs"
        icon={FiEye}
        onClick={() => onViewDetails(student)}
      >
        Inspect Student
      </Button>
    </Card>
  )
}
