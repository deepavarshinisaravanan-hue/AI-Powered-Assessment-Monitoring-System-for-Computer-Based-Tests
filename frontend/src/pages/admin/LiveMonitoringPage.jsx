import { useState, useEffect, useMemo } from "react"
import PageHeader from "../../components/common/PageHeader"
import FilterBar from "../../components/common/FilterBar"
import LiveStudentGrid from "../../components/monitoring/LiveStudentGrid"
import StudentDetailModal from "../../components/monitoring/StudentDetailModal"
import Loader from "../../components/ui/Loader"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import { monitoringService } from "../../services/monitoringService"
import { departments } from "../../mock/students"
import { FiRefreshCw, FiVideo } from "react-icons/fi"
import toast from "react-hot-toast"

export default function LiveMonitoringPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ department: "", status: "" })
  const [selectedStudent, setSelectedStudent] = useState(null)

  const fetchLive = async () => {
    try {
      const res = await monitoringService.getLiveStudents()
      setStudents(res.students)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLive()
    const interval = setInterval(fetchLive, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    fetchLive()
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

  if (loading && !students.length) return <Loader label="Connecting to proctoring camera streams..." />

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
        description="Real-time multi-candidate camera feeds, AI anomaly alerts, and active session monitoring."
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="danger" dot className="px-3 py-1 text-xs animate-pulse">
              <FiVideo className="inline mr-1" /> {students.length} Streams Active ({flaggedCount} Flagged)
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
