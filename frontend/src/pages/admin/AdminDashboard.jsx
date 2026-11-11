import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "../../components/common/PageHeader"
import StatCard from "../../components/cards/StatCard"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import BarChart from "../../components/charts/BarChart"
import DonutChart from "../../components/charts/DonutChart"
import ChartWrapper from "../../components/charts/ChartWrapper"
import Loader from "../../components/ui/Loader"
import { dashboardService } from "../../services/dashboardService"
import {
  FiUsers,
  FiPlayCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiVideo,
  FiFileText,
  FiActivity,
  FiArrowRight,
} from "react-icons/fi"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAdminData() {
      try {
        const res = await dashboardService.getAdminStats()
        if (!cancelled) setData(res)
      } catch (error) {
        if (!cancelled) setLoadError(error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAdminData()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <Loader label="Loading administrator dashboard..." />
  if (loadError || !data) {
    return <Card className="p-6 text-sm text-danger">{loadError || "Dashboard data is unavailable."}</Card>
  }

  const { stats, violationSummary, performanceData, weeklyExams, recentActivities } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Monitoring Overview"
        description="Real-time proctoring metrics, candidate statistics, and examination integrity insights."
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={FiFileText}
              onClick={() => navigate("/admin/reports")}
            >
              Export Reports
            </Button>
            <Button
              variant="primary"
              icon={FiVideo}
              onClick={() => navigate("/admin/monitoring")}
            >
              Launch Live Proctor Console
            </Button>
          </div>
        }
      />

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtext="Registered student accounts"
          icon={FiUsers}
          variant="primary"
        />
        <StatCard
          title="Running Exams"
          value={stats.runningExams}
          subtext="Active monitoring sessions"
          icon={FiPlayCircle}
          variant="secondary"
        />
        <StatCard
          title="Completed Exams"
          value={stats.completedExams}
          subtext="Saved assessment reports"
          icon={FiCheckCircle}
          variant="success"
        />
        <StatCard
          title="Violations Flagged"
          value={stats.violations}
          subtext="Persisted violation records"
          icon={FiAlertTriangle}
          variant="danger"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          title="Violation Type Breakdown"
          subtitle="Distribution of security flags detected during active exams"
        >
          {violationSummary.length ? (
            <DonutChart data={violationSummary} height={260} />
          ) : (
            <p className="py-12 text-center text-sm text-muted">No violations have been recorded.</p>
          )}
        </ChartWrapper>

        <ChartWrapper
          title="Candidate Score Distribution"
          subtitle="Percentage distribution across all completed assessments"
        >
          {performanceData.some((bucket) => bucket.value > 0) ? (
            <BarChart data={performanceData} height={260} />
          ) : (
            <p className="py-12 text-center text-sm text-muted">No saved assessment scores.</p>
          )}
        </ChartWrapper>
      </div>

      {/* Live Status & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Exam Activity Chart (2 cols) */}
        <div className="lg:col-span-2">
          <ChartWrapper
            title="Weekly Submission Volume"
            subtitle="Saved assessment reports by day over the last week"
            action={
              <Button
                variant="ghost"
                size="sm"
                icon={FiArrowRight}
                onClick={() => navigate("/admin/reports")}
              >
                View Details
              </Button>
            }
          >
            <BarChart data={weeklyExams} height={250} />
          </ChartWrapper>
        </div>

        {/* Live Proctor Stream Activity Log */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FiActivity className="text-primary" /> Live Audit Log
            </h3>
            <Badge variant="danger" dot className="animate-pulse">
              Live
            </Badge>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {recentActivities.length ? recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl border border-border/60 bg-muted/10 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-medium text-foreground">{act.text}</p>
                  <span className="text-[10px] text-muted font-mono">{act.time}</span>
                </div>
                <Badge
                  variant={
                    act.type === "danger"
                      ? "danger"
                      : act.type === "warning"
                      ? "warning"
                      : act.type === "success"
                      ? "success"
                      : "info"
                  }
                  className="text-[9px] uppercase font-bold shrink-0"
                >
                  {act.type}
                </Badge>
              </div>
            )) : <p className="text-sm text-muted">No persisted activity yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
