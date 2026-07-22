import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PageHeader from "../../components/common/PageHeader"
import StatCard from "../../components/cards/StatCard"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import LineChart from "../../components/charts/LineChart"
import ChartWrapper from "../../components/charts/ChartWrapper"
import Loader from "../../components/ui/Loader"
import { dashboardService } from "../../services/dashboardService"
import { mockExam } from "../../mock/questions"
import { useAuth } from "../../context/AuthContext"
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiArrowRight,
  FiPlay,
  FiFileText,
  FiBell,
  FiActivity,
} from "react-icons/fi"

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await dashboardService.getStudentDashboard()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <Loader label="Loading student dashboard..." />

  const { previousAttempts = [], performanceTrend = [], notifications = [], recentActivities = [] } = data || {}

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || "Student"}`}
        description="Monitor your upcoming computer-based assessments, test history, and proctoring integrity record."
        actions={
          <Button
            variant="primary"
            icon={FiPlay}
            onClick={() => navigate("/student/instructions")}
          >
            Start Assessment
          </Button>
        }
      />

      {/* Hero Banner / Upcoming Assessment */}
      <Card className="relative overflow-hidden p-6 lg:p-8 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-card">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="warning" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
              UPCOMING ASSESSMENT
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{mockExam.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Subject: {mockExam.subject} • Duration: {mockExam.durationMinutes} Minutes • Total Marks: {mockExam.totalMarks}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/90 pt-2">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <FiClock className="w-4 h-4 text-warning" /> Auto-Proctored Session
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <FiBookOpen className="w-4 h-4 text-success" /> 10 MCQ Questions
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white text-dark hover:bg-light border-0 shadow-md font-semibold"
              icon={FiArrowRight}
              onClick={() => navigate("/student/instructions")}
            >
              Review Rules & Start
            </Button>
          </div>
        </div>
      </Card>

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Exams"
          value="1"
          subtext="1 pending assessment"
          icon={FiBookOpen}
          variant="primary"
        />
        <StatCard
          title="Exams Completed"
          value="3"
          subtext="100% submission rate"
          icon={FiCheckCircle}
          variant="success"
        />
        <StatCard
          title="Average Score"
          value="85%"
          subtext="+4.2% from last month"
          icon={FiActivity}
          variant="secondary"
        />
        <StatCard
          title="Integrity Risk"
          value="Low"
          subtext="0 active flag warnings"
          icon={FiAlertTriangle}
          variant="warning"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Performance Trend & Previous Attempts */}
        <div className="lg:col-span-2 space-y-6">
          <ChartWrapper
            title="Performance Summary"
            subtitle="Historical score percentage across previous proctored assessments"
          >
            <LineChart data={performanceTrend} height={260} />
          </ChartWrapper>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FiFileText className="text-primary" /> Previous Attempts
              </h3>
              <Badge variant="outline">{previousAttempts.length} Records</Badge>
            </div>

            <div className="space-y-3">
              {previousAttempts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.exam}</h4>
                    <p className="text-xs text-muted font-mono">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-foreground">
                      {item.score} / {item.total}
                    </span>
                    <Badge variant={item.risk === "High" ? "danger" : item.risk === "Medium" ? "warning" : "success"}>
                      Risk: {item.risk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Notifications & Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <FiBell className="text-warning" /> Notifications
            </h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl border border-border/60 bg-muted/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{n.title}</span>
                    <span className="text-[10px] text-muted">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted">{n.message}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs text-muted">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">{act.text}</p>
                    <span className="text-[10px] font-mono">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
