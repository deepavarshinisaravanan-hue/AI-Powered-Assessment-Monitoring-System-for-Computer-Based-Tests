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
import { useAuth } from "../../context/AuthContext"
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiArrowRight,
  FiPlay,
  FiFileText,
  FiActivity,
} from "react-icons/fi"

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchDashboard() {
      try {
        const result = await dashboardService.getStudentDashboard(user?.id)
        if (!cancelled) setData(result)
      } catch (error) {
        if (!cancelled) setLoadError(error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDashboard()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (loading) return <Loader label="Loading student dashboard..." />

  if (loadError || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 text-sm text-danger">
          {loadError || "Student dashboard data is unavailable."}
        </Card>
      </div>
    )
  }

  const { currentExam, questionCount, assessments, previousAttempts } = data
  const averageScore = previousAttempts.length
    ? Math.round(previousAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / previousAttempts.length)
    : null
  const performanceTrend = previousAttempts
    .slice()
    .reverse()
    .map((attempt, index) => ({ label: `Attempt ${index + 1}`, value: attempt.percentage }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || "Student"}`}
        description="Monitor your upcoming computer-based assessments, test history, and proctoring integrity record."
        actions={
          <Button
            variant="primary"
            icon={FiPlay}
            disabled={!currentExam}
            onClick={() => navigate(`/student/instructions?exam_id=${currentExam?.id}`)}
          >
            Start Assessment
          </Button>
        }
      />

      {/* Current published assessment */}
      <Card className="relative overflow-hidden p-6 lg:p-8 bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-card">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            {currentExam ? (
              <>
                <Badge variant="warning" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                  PUBLISHED ASSESSMENT
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{currentExam.title}</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Duration: {currentExam.duration_minutes} Minutes • {questionCount} Questions
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/90 pt-2">
                  <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <FiClock className="w-4 h-4 text-warning" /> Auto-Proctored Session
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <FiBookOpen className="w-4 h-4 text-success" /> {questionCount} Questions
                  </span>
                </div>
              </>
            ) : (
              <h2 className="text-2xl font-bold">No published assessment is available.</h2>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white text-dark hover:bg-light border-0 shadow-md font-semibold"
              icon={FiArrowRight}
              disabled={!currentExam}
              onClick={() => navigate(`/student/instructions?exam_id=${currentExam?.id}`)}
            >
              Review Rules & Start
            </Button>
          </div>
        </div>
      </Card>

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Exams"
          value={assessments.length}
          subtext={assessments.length ? "Assigned assessments available" : "No published assessment"}
          icon={FiBookOpen}
          variant="primary"
        />
        <StatCard
          title="Exams Completed"
          value={previousAttempts.length}
          subtext="Saved submissions"
          icon={FiCheckCircle}
          variant="success"
        />
        <StatCard
          title="Average Score"
          value={averageScore === null ? "--" : `${averageScore}%`}
          subtext={averageScore === null ? "No saved submissions" : "Across saved submissions"}
          icon={FiActivity}
          variant="secondary"
        />
      </div>

      {assessments.length > 1 && <Card className="p-5 lg:p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground">All assigned assessments</h3>
        <div className="space-y-3">
          {assessments.map((assessment) => <div key={assessment.id} className="flex flex-col gap-3 rounded-xl border border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="font-semibold text-foreground">{assessment.title}</h4>
              <p className="text-sm text-muted">{assessment.duration_minutes} minutes · {assessment.question_count} questions</p>
              {assessment.description && <p className="mt-1 text-sm text-muted">{assessment.description}</p>}
            </div>
            <Button variant="outline" icon={FiPlay} onClick={() => navigate(`/student/instructions?exam_id=${assessment.id}`)}>Start</Button>
          </div>)}
        </div>
      </Card>}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ChartWrapper
            title="Performance Summary"
            subtitle="Historical score percentage across previous proctored assessments"
          >
            {performanceTrend.length ? (
              <LineChart data={performanceTrend} height={260} />
            ) : (
              <p className="py-12 text-center text-sm text-muted">No saved score history.</p>
            )}
          </ChartWrapper>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FiFileText className="text-primary" /> Previous Attempts
            </h3>
            <Badge variant="outline">{previousAttempts.length} Records</Badge>
          </div>
          {previousAttempts.length ? (
            <div className="space-y-3">
              {previousAttempts.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/80 bg-card">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.exam}</h4>
                    <p className="text-xs text-muted font-mono">{item.date}</p>
                  </div>
                  <Badge variant={item.status === "completed" ? "success" : "warning"}>
                    {item.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted">No saved assessment attempts.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
