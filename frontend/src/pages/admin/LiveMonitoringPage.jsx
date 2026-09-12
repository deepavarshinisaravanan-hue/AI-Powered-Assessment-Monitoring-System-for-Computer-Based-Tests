import { useState, useEffect, useMemo } from "react"
import PageHeader from "../../components/common/PageHeader"
import FilterBar from "../../components/common/FilterBar"
import LiveStudentGrid from "../../components/monitoring/LiveStudentGrid"
import StudentDetailModal from "../../components/monitoring/StudentDetailModal"
import Loader from "../../components/ui/Loader"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { monitoringService } from "../../services/monitoringService"
import { violationService } from "../../services/violationService"
import { departments } from "../../mock/students"
import { FiRefreshCw, FiVideo } from "react-icons/fi"
import toast from "react-hot-toast"

export default function LiveMonitoringPage() {
  const [students, setStudents] = useState([])
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ department: "", status: "" })
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Fetch students and violations data
  const fetchLiveData = async () => {
    try {
      const res = await monitoringService.getLiveStudents()
      const studentsData = res.students
      
      // Fetch violations for current exam (using exam_id = 1 as default)
      const violationsData = await violationService.getExamViolations(1)
      setViolations(violationsData)
      
      // Enrich student data with violation counts
      const enrichedStudents = studentsData.map((student) => {
        const studentViolations = violationsData.filter((v) => v.student_id === student.id)
        return {
          ...student,
          violations: studentViolations.length,
          violationsList: studentViolations,
        }
      })
      
      setStudents(enrichedStudents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveData()
    // Poll for violations every 5 seconds
    const interval = setInterval(fetchLiveData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    fetchLiveData()
    toast.success("Telemetry feed refreshed.")
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

  if (loading && !students.length) return <Loader label="Connecting to live monitoring..." />

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
            <Button variant="outline" icon={FiRefreshCw} onClick={handleRefresh}>
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

      <LiveStudentGrid
        students={filteredStudents}
        onViewDetails={(student) => setSelectedStudent(student)}
      />

      <StudentDetailModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  )
}
