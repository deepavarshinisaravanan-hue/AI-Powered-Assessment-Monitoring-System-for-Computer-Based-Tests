import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import PageHeader from "../../components/common/PageHeader"
import FilterBar from "../../components/common/FilterBar"
import LiveStudentGrid from "../../components/monitoring/LiveStudentGrid"
import StudentDetailModal from "../../components/monitoring/StudentDetailModal"
import Loader from "../../components/ui/Loader"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import { monitoringService } from "../../services/monitoringService"
import { createWebRTCSignaling } from "../../services/webrtcService"
import { violationService } from "../../services/violationService"
import { departments } from "../../mock/students"
import { FiRefreshCw, FiVideo } from "react-icons/fi"
import toast from "react-hot-toast"

export default function LiveMonitoringPage() {
  const [students, setStudents] = useState([])
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ department: "", status: "" })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const peerConnectionRef = useRef(null)
  const signalingRef = useRef(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [remoteCameraStream, setRemoteCameraStream] = useState(null)
  const [cameraUnavailable, setCameraUnavailable] = useState(false)
  const remoteTrackKindsRef = useRef(new Map())

  const videoRef = useRef(null)
  const cameraVideoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream
      videoRef.current.play().catch((error) => {
        console.error("Failed to play remote student stream:", error)
      })
    }
  }, [remoteStream])

  useEffect(() => {
    if (cameraVideoRef.current && remoteCameraStream) {
      cameraVideoRef.current.srcObject = remoteCameraStream
      cameraVideoRef.current.play().catch((error) => {
        console.error("Failed to play remote student camera:", error)
      })
    }
  }, [remoteCameraStream])

  // Fetch students and violations data
  const fetchLiveData = useCallback(async () => {
    console.log("[LiveMonitoringPage] fetchLiveData entered")
    try {
      const res = await monitoringService.getLiveStudents()
      console.log("[LiveMonitoringPage] monitoring service returned sessions:", res.students)
      const studentsData = res.students

      const examIds = [...new Set(studentsData.map((student) => student.examId))]
      const violationResults = await Promise.all(
        examIds.map((examId) => violationService.getExamViolations(examId))
      )
      const violationsData = violationResults.flat()
      setViolations(violationsData)

      // Enrich student data with violation counts
      const enrichedStudents = studentsData.map((student) => {
        const sessionStartedAt = Date.parse(student.startedAt)
        const studentViolations = violationsData.filter(
          (violation) =>
            violation.student_id === student.studentId &&
            violation.exam_id === student.examId &&
            Number.isFinite(sessionStartedAt) &&
            Date.parse(violation.created_at) >= sessionStartedAt
        )
        return {
          ...student,
          violations: studentViolations.length,
          violationsList: studentViolations,
        }
      })

      setStudents(enrichedStudents)
      setLoadError("")
      return true
    } catch (error) {
      console.error("[LiveMonitoringPage] monitoring session fetch failed:", error)
      console.error("Failed to load live monitoring data:", error)
      setLoadError(error.message || "Could not load active monitoring sessions.")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log("[LiveMonitoringPage] mounted; requesting active monitoring sessions")
    void fetchLiveData()
    // Poll active sessions and violations every five seconds.
    const interval = setInterval(() => void fetchLiveData(), 5000)
    return () => clearInterval(interval)
  }, [fetchLiveData])

  const connectToStudent = (sessionId) => {
    console.info(`[WebRTC ${sessionId}/faculty] connecting to selected monitoring session`)
    peerConnectionRef.current?.close()
    signalingRef.current?.close()
    setRemoteStream(null)
    setRemoteCameraStream(null)
    setCameraUnavailable(false)
    remoteTrackKindsRef.current.clear()
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
      log(`[WebRTC ${sessionId}/faculty] peer connection state: ${state}`)
    }
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      const log = state === "failed" ? console.error : console.info
      log(`[WebRTC ${sessionId}/faculty] ICE connection state: ${state}`)
    }
    pc.onicecandidateerror = (event) => {
      console.error(`[WebRTC ${sessionId}/faculty] ICE candidate error (${event.errorCode}): ${event.errorText}`)
    }
    const signaling = createWebRTCSignaling(
      sessionId,
      "faculty",
      async (message) => {
        if (peerConnectionRef.current !== pc || pc.connectionState === "closed") return

        if (message.type === "offer") {
          console.info(`[WebRTC ${sessionId}/faculty] received student offer`)
          if (Array.isArray(message.videoTracks)) {
            setCameraUnavailable(
              !message.videoTracks.some(({ label }) => label === "camera")
            )
          }
          remoteTrackKindsRef.current = new Map(
            (message.videoTracks || []).map(({ mid, label }) => [mid, label])
          )
          await pc.setRemoteDescription(
            new RTCSessionDescription(message.sdp)
          )
          for (const candidate of pendingIceCandidates.splice(0)) {
            await pc.addIceCandidate(candidate)
          }

          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)

          if (!signaling.send({
            type: "answer",
            sdp: answer,
          })) {
            throw new Error("Signaling socket is closed; faculty answer could not be sent.")
          }
        }

        if (message.type === "ready") {
          signaling.send({ type: "ready" })
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

    pc.ontrack = (event) => {
      const trackLabel =
        remoteTrackKindsRef.current.get(event.transceiver.mid) ||
        (event.transceiver.mid === "0" ? "screen" : "camera")
      const trackStream = new MediaStream([event.track])
      console.info(`[WebRTC ${sessionId}/faculty] received ${trackLabel} ${event.track.kind} track (${event.track.id}, mid ${event.transceiver.mid})`)

      if (trackLabel === "screen") {
        setRemoteStream(trackStream)
      } else if (trackLabel === "camera") {
        setRemoteCameraStream(trackStream)
        setCameraUnavailable(false)
        event.track.addEventListener("ended", () => {
          setRemoteCameraStream(null)
          setCameraUnavailable(true)
        }, { once: true })
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.send({
          type: "ice-candidate",
          candidate: event.candidate,
        })
      }
    }

  }

  useEffect(() => () => {
    peerConnectionRef.current?.close()
    signalingRef.current?.close()
  }, [])

  const handleRefresh = async () => {
    console.log("[LiveMonitoringPage] Refresh Grid clicked")
    if (refreshing) return
    setRefreshing(true)
    const succeeded = await fetchLiveData()
    setRefreshing(false)
    if (succeeded) toast.success("Live monitoring sessions refreshed.")
    else toast.error("Could not refresh live monitoring sessions.")
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase())
      const matchDept = !filters.department || s.department === filters.department
      const matchStatus = !filters.status || s.status === filters.status
      return matchSearch && matchDept && matchStatus
    })
  }, [students, search, filters])


  const filterConfigs = [
    {
      key: "department",
      placeholder: "All Departments",
      options: [
        { label: "All Departments", value: "" },
        ...departments.map((d) => ({ label: d, value: d })),
      ],
    },
    {
      key: "status",
      placeholder: "All Statuses",
      options: [
        { label: "All Statuses", value: "" },
        { label: "Active", value: "Active" },
        { label: "Flagged", value: "Flagged" },
        { label: "Idle", value: "Idle" },
      ],
    },
  ]

  const flaggedCount = students.filter((s) => s.status === "Flagged" || s.violations >= 5).length

  if (loading && !students.length) return <Loader label="Connecting to live monitoring..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Proctoring Console"
        description="Real-time student screen monitoring, violation alerts, and active examination sessions."
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="danger" dot className="px-3 py-1 text-xs animate-pulse">
              <FiVideo className="inline mr-1" /> {students.length} Students Active ({flaggedCount} Flagged)
            </Badge>
            <Button variant="outline" icon={FiRefreshCw} loading={refreshing} onClick={handleRefresh}>
              Refresh Grid
            </Button>
          </div>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name or roll number..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={(key, val) => setFilters((prev) => ({ ...prev, [key]: val }))}
        onReset={() => {
          setSearch("")
          setFilters({ department: "", status: "" })
        }}
      />

      {loadError && (
        <Alert type="danger" title="Live monitoring request failed">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button size="sm" variant="outline" loading={refreshing} onClick={handleRefresh}>
              Retry request
            </Button>
          </div>
        </Alert>
      )}

      <LiveStudentGrid
        students={filteredStudents}
        selectedStudentId={selectedStudent?.id}
        remoteScreenStream={remoteStream}
        remoteCameraStream={remoteCameraStream}
        cameraUnavailable={cameraUnavailable}
        onViewDetails={(student) => {
          setSelectedStudent(student)
          connectToStudent(student.id)
        }}
      />

      {remoteStream && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">
              Live Student Screen
            </h3>

            <Badge variant="success" dot>
              LIVE
            </Badge>
          </div>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Student Screen"
            className="w-full rounded-xl bg-black object-contain"
          />
          {remoteCameraStream && (
            <div className="mt-4 max-w-xs">
              <h4 className="mb-2 text-sm font-semibold text-foreground">Student Camera</h4>
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
        </div>
      )}

      <StudentDetailModal
        student={selectedStudent}
        remoteStream={remoteStream}
        remoteCameraStream={remoteCameraStream}
        cameraUnavailable={cameraUnavailable}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  )
}
