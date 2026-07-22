import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import { FiCamera, FiVideoOff, FiCheckCircle, FiAlertCircle, FiWifi } from "react-icons/fi"
import Badge from "../ui/Badge"

export default function WebcamFeed({
  onFrame,
  isMonitoring = true,
  className = "",
  showOverlay = true,
}) {
  const webcamRef = useRef(null)
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState("Excellent")

  const handleUserMedia = () => {
    setHasPermission(true)
    setCameraActive(true)
  }

  const handleUserMediaError = () => {
    setHasPermission(false)
    setCameraActive(false)
  }

  // Periodic frame analysis simulation
  useEffect(() => {
    if (!isMonitoring) return
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot()
        onFrame?.(imageSrc)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isMonitoring, onFrame])

  return (
    <div className={`relative bg-dark rounded-2xl overflow-hidden border border-border/60 shadow-card ${className}`}>
      {/* Live Video or Fallback Mock */}
      <div className="relative aspect-video w-full flex items-center justify-center bg-dark/95">
        {hasPermission !== false ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
            videoConstraints={{
              width: 640,
              height: 360,
              facingMode: "user",
            }}
          />
        ) : (
          /* Mock Camera Feed simulation if physical camera unavailable or blocked */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-dark to-slate-900">
            {/* Animated Face Bounding Box Mock */}
            <div className="relative w-32 h-40 rounded-3xl border-2 border-dashed border-primary/60 flex items-center justify-center mb-3 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
                <FiCamera className="w-8 h-8 text-primary" />
              </div>
              <span className="absolute -top-2 bg-primary text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                FACE DETECTED
              </span>
            </div>
            <p className="text-xs text-muted font-mono">Camera Feed Simulation (No Physical Camera)</p>
          </div>
        )}

        {/* Live HUD Overlay */}
        {showOverlay && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                <span className="w-2 h-2 rounded-full bg-danger animate-ping" />
                REC LIVE
              </span>
              <Badge variant="success" className="bg-success/20 text-success border border-success/30 backdrop-blur-md text-xs">
                AI Proctor Active
              </Badge>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark/80 backdrop-blur-md text-white/90 text-xs font-mono border border-white/10">
                <FiWifi className="w-3.5 h-3.5 text-success" />
                {connectionQuality}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 px-3 py-2 rounded-xl bg-dark/70 backdrop-blur-md border border-white/10 text-xs text-white/90">
              <div className="flex items-center gap-2">
                {cameraActive ? (
                  <span className="flex items-center gap-1 text-success font-medium">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Camera Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning font-medium">
                    <FiAlertCircle className="w-3.5 h-3.5" /> Virtual Stream
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-white/60">30 FPS | 720p</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
