import { useParams, useNavigate } from "react-router-dom"
import PageHeader from "../../components/common/PageHeader"
import Card from "../../components/ui/Card"
import Badge from "../../components/ui/Badge"
import Avatar from "../../components/ui/Avatar"
import Button from "../../components/ui/Button"
import ViolationList from "../../components/monitoring/ViolationList"
import { mockReports } from "../../mock/data"
import { VIOLATION_TYPES } from "../../constants"
import { formatDate } from "../../utils"
import {
  FiArrowLeft,
  FiCheckCircle,
  FiAlertTriangle,
  FiShield,
  FiSlash,
  FiDownload,
  FiMail,
  FiPhone,
  FiBook,
} from "react-icons/fi"
import toast from "react-hot-toast"

export default function StudentDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find candidate by ID or default to first mock report
  const student = mockReports.find((r) => r.id === id) || mockReports[0]

  // Generate mock violation list for this student
  const mockStudentViolations = Array.from({ length: student.violations || 3 }).map((_, i) => {
    const vType = VIOLATION_TYPES[i % VIOLATION_TYPES.length]
    return {
      id: `sv_${i}`,
      type: vType.key,
      label: vType.label,
      severity: vType.severity,
      time: new Date(Date.now() - (i + 1) * 300000).toISOString(),
      details: "Detected during automated proctor AI telemetry scan.",
    }
  })

  const handleClearFlag = () => {
    toast.success(`Flag cleared for candidate ${student.name}. Status updated to Cleared.`)
  }

  const handleSuspend = () => {
    toast.error(`Candidate ${student.name} marked as Suspended.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Candidate Audit Log: ${student.name}`}
        description="Detailed anti-cheat proctoring history, score breakdown, and security violation audit."
        breadcrumbs={[
          { label: "Admin Dashboard", path: "/admin/dashboard" },
          { label: "Reports", path: "/admin/reports" },
          { label: student.name, path: `/admin/student/${student.id}` },
        ]}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={FiArrowLeft}
              onClick={() => navigate("/admin/reports")}
            >
              Back to Reports
            </Button>
            <Button
              variant="primary"
              icon={FiDownload}
              onClick={() => toast.success("Downloading candidate audit dossier PDF...")}
            >
              Export Dossier
            </Button>
          </div>
        }
      />

      {/* Hero Profile Card */}
      <Card className="p-6 md:p-8 bg-card border-border/80 shadow-soft">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size="xl" />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
                <Badge variant={student.risk === "High" ? "danger" : student.risk === "Medium" ? "warning" : "success"}>
                  {student.risk} Risk
                </Badge>
              </div>
              <p className="text-xs text-muted font-mono">
                Roll No: {student.rollNo} • Department: {student.department}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted pt-1">
                <span className="flex items-center gap-1">
                  <FiMail className="w-3.5 h-3.5" /> student@proctorx.com
                </span>
                <span className="flex items-center gap-1">
                  <FiPhone className="w-3.5 h-3.5" /> +91 98765 43210
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={FiCheckCircle}
              onClick={handleClearFlag}
            >
              Clear Flags
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={FiSlash}
              onClick={handleSuspend}
            >
              Suspend Session
            </Button>
          </div>
        </div>
      </Card>

      {/* Assessment Performance & Integrity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score & Assessment Summary */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FiBook className="text-primary" /> Assessment Record
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Assessment Name</span>
                <span className="font-semibold text-foreground">{student.exam}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Total Score</span>
                <span className="font-bold text-foreground">
                  {student.score} / {student.total} ({student.percentage}%)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Time Spent</span>
                <span className="font-mono text-foreground">{student.timeTaken}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Assessment Date</span>
                <span className="font-mono text-foreground">{formatDate(student.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Proctor Audit Status</span>
                <Badge variant={student.status === "Flagged" ? "danger" : "success"}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Violation Timeline Audit */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FiShield className="text-danger" /> Logged Violation Timeline
              </h3>
              <Badge variant="danger">{mockStudentViolations.length} Violations</Badge>
            </div>

            <ViolationList violations={mockStudentViolations} />
          </Card>
        </div>
      </div>
    </div>
  )
}
