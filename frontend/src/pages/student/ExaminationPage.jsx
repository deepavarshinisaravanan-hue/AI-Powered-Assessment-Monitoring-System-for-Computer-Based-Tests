import { useState, useEffect, useCallback, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createWebRTCSignaling } from "../../services/webrtcService"
import { getScreenShareUnavailableReason } from "../../utils/screenShare"
import { useAuth } from "../../context/AuthContext"
import { useExam } from "../../context/ExamContext"
import { useMonitoring } from "../../context/MonitoringContext"
import { useFullscreen } from "../../hooks/useFullscreen"
import { useAntiCheat } from "../../hooks/useAntiCheat"
import { useTimer } from "../../hooks/useTimer"
import { monitoringService } from "../../services/monitoringService"
import MonitoringStatus from "../../components/monitoring/MonitoringStatus"
import ViolationAlert from "../../components/monitoring/ViolationAlert"
import ViolationList from "../../components/monitoring/ViolationList"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import Progress from "../../components/ui/Progress"
import Modal from "../../components/ui/Modal"
import { formatTime } from "../../utils"
import { violationService } from "../../services/violationService"
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
  FiCamera,
} from "react-icons/fi"
import toast from "react-hot-toast"

export default function ExaminationPage() {
  const navigate = useNavigate()
  const location = useLocation()
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

  const {
    status,
    violations,
    violationCount,
    logViolation,
    updateStatus,
  } = useMonitoring()

  const [activeViolation, setActiveViolation] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [screenShareReady, setScreenShareReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)
  const [monitoringSessionId, setMonitoringSessionId] = useState(null)

  // Anti-cheat will start only after exam initialization is complete
  const [antiCheatReady, setAntiCheatReady] = useState(false)

  const screenStreamRef = useRef(null)
  const cameraStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const signalingRef = useRef(null)
  const monitoringStartedRef = useRef(false)
  const submissionStartedRef = useRef(false)
  const lastReportedViolationRef = useRef(new Map())
  const cameraHealthIntervalRef = useRef(null)
  const cameraTrackRef = useRef(null)
  const cameraWasHealthyRef = useRef(false)
  const cameraViolationReportedRef = useRef(false)

  // Violation metadata
  const violationMeta = {
    fullscreen: {
      severity: "medium",
      description: "Candidate exited required fullscreen mode",
    },
    window_blur: {
      severity: "medium",
      description: "Candidate switched away from the examination window",
    },
    camera_off: {
      severity: "high",
      description: "Camera monitoring became unavailable",
    },
    tab: {
      severity: "medium",
      description: "Browser tab change / focus lost detected",
    },
    rightclick: {
      severity: "low",
      description: "Right-click context menu prohibited",
    },
    copy: {
      severity: "low",
      description: "Copying text content is disabled",
    },
    paste: {
      severity: "low",
      description: "Pasting text content is disabled",
    },
    screen_share_denied: {
      severity: "high",
      description: "Screen sharing permission was denied",
    },
    screen_share_stopped: {
      severity: "high",
      description: "Screen sharing stopped during the exam",
    },
  }

  // Send violation to backend
  const reportViolationToBackend = useCallback(
    (typeKey) => {
      if (!exam?.id || !user?.id) return

      const now = Date.now()
      const lastReportedAt = lastReportedViolationRef.current.get(typeKey) || 0
      if (now - lastReportedAt < 4000) return
      lastReportedViolationRef.current.set(typeKey, now)

      const meta =
        violationMeta[typeKey] || {
          severity: "medium",
          description: "Security violation recorded",
        }

      violationService.reportViolation(
        exam.id,
        typeKey,
        meta.severity,
        meta.description,
        user.id
      )
    },
    [exam?.id, user?.id]
  )

  const completeMonitoringSession = useCallback(async () => {
    if (!monitoringSessionId) return

    try {
      await monitoringService.updateSessionStatus(monitoringSessionId, "completed")
    } catch (error) {
      // A monitoring cleanup failure must not turn a saved exam into a failed
      // submission or invite the student to submit the same answers again.
      console.error("Failed to complete monitoring session:", error)
    }
  }, [monitoringSessionId])

  // Fullscreen violation
  const handleFullscreenExit = useCallback(() => {
    if (!monitoringStartedRef.current) return

    logViolation("fullscreen")
    reportViolationToBackend("fullscreen")
    updateStatus({ fullscreen: false })
  }, [logViolation, reportViolationToBackend, updateStatus])

  const {
    isFullscreen,
    enter: enterFullscreen,
  } = useFullscreen(handleFullscreenExit)

  // Anti-cheat
  useAntiCheat(antiCheatReady, (typeKey) => {
    if (!monitoringStartedRef.current) return

    logViolation(typeKey)
    reportViolationToBackend(typeKey)

    if (typeKey === "tab" || typeKey === "window_blur") {
      updateStatus({ browser: false })
    }

    const meta = {
      fullscreen: {
        label: "Candidate exited required fullscreen mode",
        severity: "medium",
      },
      tab: {
        label: "Browser tab change / focus lost detected",
        severity: "medium",
      },
      rightclick: {
        label: "Right-click context menu prohibited",
        severity: "low",
      },
      copy: {
        label: "Copying text content is disabled",
        severity: "low",
      },
      paste: {
        label: "Pasting text content is disabled",
        severity: "low",
      },
    }[typeKey] || {
      label: "Security violation recorded",
      severity: "medium",
    }

    setActiveViolation({
      ...meta,
      time: new Date().toISOString(),
    })
  })

  // Timer
  const examDurationMinutes = Number(exam?.duration_minutes)
  const examDurationSeconds =
    Number.isFinite(examDurationMinutes) && examDurationMinutes > 0
      ? examDurationMinutes * 60
      : 0

  const handleTimerExpire = useCallback(async () => {
    if (submissionStartedRef.current || !exam?.id) return
    submissionStartedRef.current = true
    setShowConfirm(true)
    toast.error("Time expired! Automatically submitting your assessment.")

    setSubmitting(true)

    try {
      const result = await submitExam(violationCount, examDurationSeconds)
      void completeMonitoringSession()

      navigate("/student/result", {
        state: { result },
      })
    } catch (error) {
      submissionStartedRef.current = false
      setSubmitting(false)
      setShowConfirm(true)
      toast.error(error.message || "Assessment submission failed. Your answers are still available to retry.")
      console.error("Assessment submission failed:", error)
    }
  }, [submitExam, violationCount, navigate, completeMonitoringSession, exam?.id, examDurationSeconds])

  const { seconds: timeLeft } = useTimer(
    examDurationSeconds,
    handleTimerExpire,
    timerStarted
  )

  // Screen share stopped
  const handleScreenShareStop = useCallback(() => {
    if (!monitoringStartedRef.current || !screenShareReady) return

    logViolation("screen_share_stopped")
    reportViolationToBackend("screen_share_stopped")

    setScreenShareReady(false)

    setActiveViolation({
      label: "Screen sharing stopped during the exam",
      severity: "high",
      time: new Date().toISOString(),
    })

    toast.error("Screen sharing stopped. This is a violation.")
  }, [
    logViolation,
    reportViolationToBackend,
    screenShareReady,
  ])

  // Request screen share
  const requestScreenShare = useCallback(async () => {
    const screenShareIssue = getScreenShareUnavailableReason()
    if (screenShareIssue) {
      toast.error(screenShareIssue)
      setScreenShareReady(false)
      return
    }

    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: 30,
          },
          audio: false,
        })

      screenStreamRef.current = stream

      const track = stream.getVideoTracks()[0]

      if (track) {
        track.addEventListener(
          "ended",
          screenShareEndedHandlerRef.current
        )
      }

      setScreenShareReady(true)
    } catch (error) {
      if (monitoringStartedRef.current) {
        logViolation("screen_share_denied")
        reportViolationToBackend("screen_share_denied")

        setActiveViolation({
          label: "Screen sharing is required to continue the exam",
          severity: "high",
          time: new Date().toISOString(),
        })
      }

      setScreenShareReady(false)

      toast.error(
        "Screen sharing is required to continue the exam."
      )
    }
  }, [
    handleScreenShareStop,
    logViolation,
    reportViolationToBackend,
  ])

  const handleCameraUnavailable = useCallback(() => {
    setCameraReady(false)

    if (
      !monitoringStartedRef.current ||
      !cameraWasHealthyRef.current ||
      cameraViolationReportedRef.current
    ) {
      return
    }

    cameraWasHealthyRef.current = false
    cameraViolationReportedRef.current = true
    setActiveViolation({
      label: "Camera monitoring stopped",
      severity: "high",
      time: new Date().toISOString(),
    })
    logViolation("camera_off")
    reportViolationToBackend("camera_off")
  }, [logViolation, reportViolationToBackend])

  const checkCameraHealth = useCallback(() => {
    const stream = cameraStreamRef.current
    const videoTrack = cameraTrackRef.current
    const cameraIsHealthy = Boolean(
      stream?.active &&
      videoTrack &&
      videoTrack.readyState === "live" &&
      videoTrack.enabled === true &&
      videoTrack.muted === false
    )

    if (!cameraIsHealthy) {
      handleCameraUnavailable()
      return
    }

    setCameraReady(true)
    if (exam?.id && screenStreamRef.current?.active) {
      setTimerStarted(true)
    }
    if (monitoringStartedRef.current) {
      cameraWasHealthyRef.current = true
      cameraViolationReportedRef.current = false
    }
  }, [exam?.id, handleCameraUnavailable])

  const cameraHealthCheckRef = useRef(checkCameraHealth)
  cameraHealthCheckRef.current = checkCameraHealth

  // Request camera
  const requestCamera = useCallback(async () => {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      toast.error("This browser does not support camera access.")
      setCameraReady(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })

      cameraStreamRef.current = stream
      cameraTrackRef.current = stream.getVideoTracks()[0] || null
      cameraWasHealthyRef.current = false
      cameraViolationReportedRef.current = false
      setCameraReady(Boolean(cameraTrackRef.current))
    } catch (error) {
      console.error("Camera access denied:", error)
      setCameraReady(false)
      toast.error("Camera access is required for this exam.")
    }
  }, [])

  const screenShareStopHandlerRef = useRef(handleScreenShareStop)
  screenShareStopHandlerRef.current = handleScreenShareStop
  const screenShareEndedHandlerRef = useRef(
    () => screenShareStopHandlerRef.current()
  )

  // Initialize exam monitoring
  useEffect(() => {
    let isMounted = true

    const existingStream = window.__examScreenStream

    if (existingStream) {
      screenStreamRef.current = existingStream
      setScreenShareReady(true)

      const track =
        existingStream.getVideoTracks()[0]

      if (track) {
        track.addEventListener(
          "ended",
          screenShareEndedHandlerRef.current
        )
      }
    } else {
      toast.error(
        "Screen sharing is required to start the exam."
      )

      setScreenShareReady(false)
    }

    const initializeMonitoring = async () => {
      await Promise.all([
          Promise.resolve(loadExam(location.state?.examId)),
        enterFullscreen(),
        requestCamera(),
      ])

      if (isMounted) {
        // Start monitoring only AFTER initialization
        monitoringStartedRef.current = true
        setAntiCheatReady(true)
        cameraHealthCheckRef.current()
        cameraHealthIntervalRef.current = window.setInterval(() => {
          if (monitoringStartedRef.current) {
            cameraHealthCheckRef.current()
          }
        }, 500)
      }
    }

    initializeMonitoring()

    return () => {
      isMounted = false

      monitoringStartedRef.current = false
      setAntiCheatReady(false)

      if (cameraHealthIntervalRef.current !== null) {
        window.clearInterval(cameraHealthIntervalRef.current)
        cameraHealthIntervalRef.current = null
      }

      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop())
        cameraStreamRef.current = null
        cameraTrackRef.current = null
      }

      if (screenStreamRef.current) {
        const stream = screenStreamRef.current
        const track =
          stream.getVideoTracks()[0]

        if (track) {
          track.removeEventListener(
            "ended",
            screenShareEndedHandlerRef.current
          )
        }
        stream.getTracks().forEach((streamTrack) => streamTrack.stop())
        if (window.__examScreenStream === stream) window.__examScreenStream = null
        screenStreamRef.current = null
      }
    }
  }, [loadExam, enterFullscreen, requestCamera, location.state?.examId])

  useEffect(() => {
    if (!exam?.id || !user?.id || !screenShareReady || !cameraReady) return

    let cancelled = false
    monitoringService
      .createSession(user.id, exam.id)
      .then((session) => {
        if (!cancelled) setMonitoringSessionId(session.id)
      })
      .catch((error) => {
        console.error("Failed to create monitoring session:", error)
        toast.error("Unable to connect to live monitoring.")
      })

    return () => {
      cancelled = true
    }
  }, [exam?.id, user?.id, screenShareReady, cameraReady])

  useEffect(() => {
    if (!monitoringSessionId) return

    return () => {
      monitoringService
        .updateSessionStatus(monitoringSessionId, "completed")
        .catch((error) => {
          console.error("Failed to complete monitoring session:", error)
        })
    }
  }, [monitoringSessionId])

  useEffect(() => {
    if (!monitoringSessionId) return

    const completeSessionOnPageHide = () => {
      monitoringService.completeSessionOnExit(monitoringSessionId)?.catch((error) => {
        console.error("Failed to complete monitoring session on page exit:", error)
      })
    }

    window.addEventListener("pagehide", completeSessionOnPageHide)
    return () => window.removeEventListener("pagehide", completeSessionOnPageHide)
  }, [monitoringSessionId])

  // WebRTC monitoring
  useEffect(() => {
    if (
      !screenShareReady ||
      !cameraReady ||
      !exam?.id ||
      !monitoringSessionId
    ) {
      return
    }

    const screenTrackId = screenStreamRef.current?.getVideoTracks()[0]?.id
    const displayTrack = screenStreamRef.current?.getVideoTracks()[0]
    if (!screenStreamRef.current?.active || !displayTrack || displayTrack.readyState !== "live") {
      console.error(`[WebRTC ${monitoringSessionId}/student] display stream is unavailable; refusing to publish an inactive screen track`)
      setScreenShareReady(false)
      return
    }
    const pendingIceCandidates = []
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    })
    peerConnectionRef.current = pc
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      const log = state === "failed" ? console.error : console.info
      log(`[WebRTC ${monitoringSessionId}/student] peer connection state: ${state}`)
    }
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      const log = state === "failed" ? console.error : console.info
      log(`[WebRTC ${monitoringSessionId}/student] ICE connection state: ${state}`)
    }
    pc.onicecandidateerror = (event) => {
      console.error(`[WebRTC ${monitoringSessionId}/student] ICE candidate error (${event.errorCode}): ${event.errorText}`)
    }
    const signaling = createWebRTCSignaling(
      monitoringSessionId,
      "student",
      async (message) => {
        if (peerConnectionRef.current !== pc || pc.connectionState === "closed") return

        if (message.type === "ready") {
          console.info(`[WebRTC ${monitoringSessionId}/student] faculty is ready; creating offer with display and camera tracks`)
          try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            const videoTracks = pc
              .getTransceivers()
              .filter((transceiver) => transceiver.sender.track?.kind === "video")
              .map((transceiver) => ({
                mid: transceiver.mid,
                label: transceiver.sender.track.id === screenTrackId ? "screen" : "camera",
              }))
            signaling.send({
              type: "offer",
              sdp: pc.localDescription,
              videoTracks,
            })
          } catch (error) {
            console.error(`[WebRTC ${monitoringSessionId}/student] failed to create or send offer:`, error)
          }
        }

        if (message.type === "answer") {
          await pc.setRemoteDescription(
            new RTCSessionDescription(message.sdp)
          )
          for (const candidate of pendingIceCandidates.splice(0)) {
            await pc.addIceCandidate(candidate)
          }
        }

        if (message.type === "ice-candidate") {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(message.candidate)
          } else {
            pendingIceCandidates.push(message.candidate)
          }
        }
      }
    )

    signalingRef.current = signaling

    const streams = [screenStreamRef.current, cameraStreamRef.current]
    const monitoringStream = new MediaStream()
    streams.forEach((stream) => {
      stream?.getTracks().forEach((track) => monitoringStream.addTrack(track))
    })
    monitoringStream.getTracks().forEach((track) => {
      console.info(`[WebRTC ${monitoringSessionId}/student] publishing ${track.kind} track (${track.id})`)
      pc.addTrack(track, monitoringStream)
    })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.send({
          type: "ice-candidate",
          candidate: event.candidate,
        })
      }
    }

    return () => {
      pc.close()
      signaling.close()

      peerConnectionRef.current = null
      signalingRef.current = null
    }
  }, [
    screenShareReady,
    cameraReady,
    exam?.id,
    monitoringSessionId,
  ])

  // Final submit
  const handleFinalSubmit = async () => {
    // Screen share remains required to start and continue the proctored exam,
    // and a stop is logged above. It must not prevent sending saved answers.
    if (!cameraReady) {
      toast.error("Camera monitoring is required to submit this assessment.")
      return
    }

    if (submissionStartedRef.current) return
    submissionStartedRef.current = true

    setSubmitting(true)

    const timeSpentSec = examDurationSeconds - timeLeft

    try {
      const res = await submitExam(violationCount, timeSpentSec)
      void completeMonitoringSession()

      toast.success("Assessment submitted successfully!")

      navigate("/student/result", {
        state: { result: res },
      })
    } catch (error) {
      submissionStartedRef.current = false
      setSubmitting(false)
      setShowConfirm(true)
      toast.error(error.message || "Assessment submission failed. Your answers are still available to retry.")
      console.error("Assessment submission failed:", error)
    }
  }

  // Loading
  if (!questions || !questions.length) {
    return (
      <div className="p-8 text-center text-muted">
        Loading exam workspace...
      </div>
    )
  }

  const currentQ = questions[current]
  const isCurrentMarked =
    !!marked[currentQ?.id]

  const selectedOption =
    answers[currentQ?.id]

  return (
    <div className="space-y-4">

      {/* Screen Share Warning */}
      {!screenShareReady && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-warning/50 bg-warning/10 text-warning text-sm font-medium">
          <span>Screen sharing is required for this exam. Please allow access to your screen to continue.</span>
          <Button variant="outline" size="sm" onClick={requestScreenShare}>
            Resume Screen Sharing
          </Button>
        </div>
      )}

      {/* Violation Alert */}
      <ViolationAlert
        violation={activeViolation}
        onDismiss={() =>
          setActiveViolation(null)
        }
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FiUser className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">
              {user?.name || "Candidate"}
            </h2>

            <p className="text-xs text-muted font-mono">
              {exam?.title || "DSA — Mid Semester"}
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-mono text-sm font-bold">
            <FiClock className="w-4 h-4 text-primary animate-pulse" />
            <span>
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>

          {/* Fullscreen */}
          <Badge
            variant={
              isFullscreen
                ? "success"
                : "warning"
            }
            className="cursor-pointer"
            onClick={enterFullscreen}
          >
            <FiMaximize className="inline mr-1" />

            {isFullscreen
              ? "Fullscreen Mode"
              : "Click to Re-enter Fullscreen"}
          </Badge>
          {!cameraReady && (
            <Button variant="outline" size="sm" onClick={requestCamera}>
              Retry Camera
            </Button>
          )}

          {/* Camera */}
          <Badge
            variant={
              cameraReady
                ? "success"
                : "warning"
            }
            dot
          >
            <FiCamera className="inline mr-1" />

            {cameraReady
              ? "Camera Monitoring Active"
              : "Camera Monitoring Required"}
          </Badge>

          {/* Violations */}
          <Badge
            variant={
              violationCount > 3
                ? "danger"
                : "info"
            }
            dot
          >
            <FiAlertTriangle className="inline mr-1" />

            {violationCount} Violations Logged
          </Badge>

          {/* Submit */}
          <Button
            variant="danger"
            size="sm"
            icon={FiSend}
            disabled={submitting}
            onClick={() =>
              setShowConfirm(true)
            }
          >
            Submit Exam
          </Button>

        </div>
      </div>

      {/* Monitoring Status */}
      <MonitoringStatus status={status} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Question Area */}
        <div className="lg:col-span-2 space-y-4">

          <Card className="p-6 space-y-6">

            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">

              <div>

                <span className="text-xs font-mono text-muted uppercase tracking-wider">
                  Question {current + 1} of{" "}
                  {questions.length}
                </span>

                <Progress
                  value={
                    ((current + 1) /
                      questions.length) *
                    100
                  }
                  className="h-1.5 w-48 mt-2"
                />

              </div>

              <Button
                variant={
                  isCurrentMarked
                    ? "warning"
                    : "outline"
                }
                size="sm"
                icon={FiBookmark}
                onClick={() =>
                  toggleMark(currentQ.id)
                }
              >
                {isCurrentMarked
                  ? "Marked for Review"
                  : "Mark for Review"}
              </Button>

            </div>

            {/* Question */}
            <div className="space-y-4">

              <h3 className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
                {currentQ.text}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">

                {currentQ.options.map(
                  (optionText, idx) => {

                    const isSelected =
                      selectedOption === idx

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          selectAnswer(
                            currentQ.id,
                            idx
                          )
                        }
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
                          {String.fromCharCode(
                            65 + idx
                          )}
                        </span>

                        <span className="text-sm font-medium pt-0.5">
                          {optionText}
                        </span>

                      </button>
                    )
                  }
                )}

              </div>

            </div>

            {/* Question Controls */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4">

              <Button
                variant="outline"
                size="sm"
                icon={FiChevronLeft}
                disabled={current === 0}
                onClick={() =>
                  goTo(current - 1)
                }
              >
                Previous
              </Button>

              <span className="text-xs text-muted font-mono">
                {answeredCount} of{" "}
                {questions.length} Answered
              </span>

              {current <
              questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    goTo(current + 1)
                  }
                >
                  Next{" "}
                  <FiChevronRight className="ml-1 inline" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  icon={FiCheckCircle}
                  onClick={() =>
                    setShowConfirm(true)
                  }
                >
                  Finish Exam
                </Button>
              )}

            </div>

          </Card>

        </div>

        {/* Right Panel */}
        <div className="space-y-6">

          {/* Question Palette */}
          <Card className="p-5">

            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">

              <span>
                Question Palette
              </span>

              <span className="text-xs font-mono font-normal text-muted">
                {answeredCount}/
                {questions.length} Answered
              </span>

            </h4>

            <div className="grid grid-cols-5 gap-2 mb-4">

              {questions.map((q, idx) => {

                const isAns =
                  answers[q.id] !== undefined

                const isMrk =
                  marked[q.id]

                const isCurr =
                  idx === current

                let bgClass =
                  "bg-muted/10 text-muted border-border"

                if (isAns)
                  bgClass =
                    "bg-success text-white border-success"

                if (isMrk)
                  bgClass =
                    "bg-warning text-dark border-warning"

                if (isAns && isMrk)
                  bgClass =
                    "bg-warning text-dark ring-2 ring-success"

                return (
                  <button
                    key={q.id}
                    onClick={() =>
                      goTo(idx)
                    }
                    className={`h-9 w-full rounded-lg font-mono text-xs font-bold border transition-all flex items-center justify-center ${bgClass} ${
                      isCurr
                        ? "ring-2 ring-primary ring-offset-2 scale-105"
                        : "hover:opacity-80"
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}

            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted pt-2 border-t border-border/60">

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                Answered
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                Review
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted inline-block" />
                Unanswered
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                Current
              </span>

            </div>

          </Card>

          {/* Security Log */}
          <Card className="p-5">

            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">

              <span className="flex items-center gap-1.5">
                <FiShield className="text-danger" />
                Live Security Log
              </span>

              <Badge
                variant="outline"
                className="text-[10px]"
              >
                {violations.length} logged
              </Badge>

            </h4>

            <ViolationList
              violations={violations}
            />

          </Card>

        </div>

      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        onClose={() => {
          if (!submitting) setShowConfirm(false)
        }}
        title="Submit Examination?"
      >

        <div className="space-y-4">

          <p className="text-sm text-muted">
            Are you sure you want to submit
            your assessment? Once submitted,
            you will not be able to modify
            your answers.
          </p>

          <div className="p-4 rounded-xl bg-muted/10 space-y-2 text-xs">

            <div className="flex justify-between">
              <span className="text-muted">
                Total Questions:
              </span>
              <span className="font-bold text-foreground">
                {questions.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted">
                Answered:
              </span>
              <span className="font-bold text-success">
                {answeredCount}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted">
                Unanswered:
              </span>
              <span className="font-bold text-warning">
                {questions.length -
                  answeredCount}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted">
                Logged Violations:
              </span>

              <span
                className={`font-bold ${
                  violationCount > 3
                    ? "text-danger"
                    : "text-foreground"
                }`}
              >
                {violationCount}
              </span>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-2">

            <Button
              variant="outline"
              disabled={submitting}
              onClick={() =>
                setShowConfirm(false)
              }
            >
              Cancel & Continue Exam
            </Button>

            <Button
              variant="primary"
              loading={submitting}
              disabled={submitting}
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
