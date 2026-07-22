import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "../../components/common/PageHeader"
import FilterBar from "../../components/common/FilterBar"
import Table from "../../components/tables/Table"
import Pagination from "../../components/ui/Pagination"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Loader from "../../components/ui/Loader"
import { reportsService } from "../../services/reportsService"
import { departments } from "../../mock/students"
import { formatDate } from "../../utils"
import { FiDownload, FiEye, FiFileText } from "react-icons/fi"
import toast from "react-hot-toast"

export default function ReportsPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ department: "", risk: "", status: "" })
  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await reportsService.getReports()
        setReports(res.reports)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const handleExport = async () => {
    toast.success("Exporting assessment reports CSV file...")
    await reportsService.exportReports()
  }

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        r.exam.toLowerCase().includes(search.toLowerCase())
      const matchDept = !filters.department || r.department === filters.department
      const matchRisk = !filters.risk || r.risk === filters.risk
      const matchStatus = !filters.status || r.status === filters.status
      return matchSearch && matchDept && matchRisk && matchStatus
    })
  }, [reports, search, filters])

  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1
  const paginatedReports = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredReports.slice(start, start + pageSize)
  }, [filteredReports, page, pageSize])

  if (loading) return <Loader label="Compiling proctoring audit reports..." />

  const filterConfigs = [
    {
      key: "department",
      placeholder: "Department",
      options: [
        { label: "All Departments", value: "" },
        ...departments.map((d) => ({ label: d, value: d })),
      ],
    },
    {
      key: "risk",
      placeholder: "Risk Level",
      options: [
        { label: "All Risk Levels", value: "" },
        { label: "Low Risk", value: "Low" },
        { label: "Medium Risk", value: "Medium" },
        { label: "High Risk", value: "High" },
      ],
    },
    {
      key: "status",
      placeholder: "Status",
      options: [
        { label: "All Statuses", value: "" },
        { label: "Completed", value: "Completed" },
        { label: "Flagged", value: "Flagged" },
      ],
    },
  ]

  const columns = [
    {
      key: "student",
      header: "Candidate Name",
      render: (row) => (
        <div>
          <span className="font-semibold text-foreground block">{row.name}</span>
          <span className="text-xs text-muted font-mono">{row.rollNo}</span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (row) => <span className="text-xs text-muted">{row.department}</span>,
    },
    {
      key: "exam",
      header: "Assessment",
      render: (row) => <span className="text-xs font-medium text-foreground">{row.exam}</span>,
    },
    {
      key: "score",
      header: "Score",
      render: (row) => (
        <span className="text-xs font-bold text-foreground">
          {row.score} / {row.total} ({row.percentage}%)
        </span>
      ),
    },
    {
      key: "violations",
      header: "Violations",
      render: (row) => (
        <span className={`text-xs font-bold ${row.violations > 3 ? "text-danger" : "text-foreground"}`}>
          {row.violations} Flags
        </span>
      ),
    },
    {
      key: "risk",
      header: "Risk Level",
      render: (row) => (
        <Badge variant={row.risk === "High" ? "danger" : row.risk === "Medium" ? "warning" : "success"}>
          {row.risk}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Submitted Date",
      render: (row) => <span className="text-xs text-muted font-mono">{formatDate(row.date)}</span>,
    },
    {
      key: "actions",
      header: "Action",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={FiEye}
          onClick={() => navigate(`/admin/student/${row.id}`)}
        >
          View Log
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Audit Reports"
        description="Comprehensive records of candidate scores, proctoring violations, and risk classification."
        actions={
          <Button variant="primary" icon={FiDownload} onClick={handleExport}>
            Export Audit Data (CSV)
          </Button>
        }
      />

      <FilterBar
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Search candidate, roll number or assessment..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={(key, val) => {
          setFilters((prev) => ({ ...prev, [key]: val }))
          setPage(1)
        }}
        onReset={() => {
          setSearch("")
          setFilters({ department: "", risk: "", status: "" })
          setPage(1)
        }}
      />

      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft">
        <Table columns={columns} data={paginatedReports} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filteredReports.length}
          pageSize={pageSize}
        />
      </div>
    </div>
  )
}
