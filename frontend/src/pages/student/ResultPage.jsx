import { useLocation, useNavigate } from "react-router-dom"
import PageHeader from "../../components/common/PageHeader"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import StatCard from "../../components/cards/StatCard"
import DonutChart from "../../components/charts/DonutChart"
import ChartWrapper from "../../components/charts/ChartWrapper"
import { useExam } from "../../context/ExamContext"
import { formatTime } from "../../utils"
import {
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiAlertTriangle,
  FiDownload,
  FiHome,
  FiClock,
  FiShield,
} from "react-icons/fi"
import toast from "react-hot-toast"

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result: contextResult } = useExam()

  // Use passed state or fallback to exam context result or default mock
  const res = location.state?.result || contextResult || {
    score: 16,
    totalMarks: 20,
    correct: 8,
    incorrect: 2,
    total: 10,
    percentage: 80,
    risk: "Low",
    violations: 1,
    timeTaken: 1420,
    submittedAt: new Date().toISOString(),
  }

  const chartData = [
    { label: "Correct Answers", value: res.correct, color: "success" },
    { label: "Incorrect / Unanswered", value: res.incorrect, color: "danger" },
  ]

  const handleDownloadReport = () => {
    toast.success("Downloading official proctored assessment report PDF...")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Assessment Result & Integrity Report"
        description="Detailed performance scorecard and anti-cheat proctoring summary."
        actions={
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload} onClick={handleDownloadReport}>
              Download Report
            </Button>
            <Button variant="primary" icon={FiHome} onClick={() => navigate("/student/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        }
      />

      {/* Hero Score Overview */}
      <Card className="p-6 md:p-8 text-center bg-gradient-to-br from-card via-card to-primary/5 border-border/80 shadow-card">
        <Badge
          variant={res.percentage >= 70 ? "success" : res.percentage >= 50 ? "warning" : "danger"}
          className="mx-auto mb-3 text-xs uppercase px-3 py-1 font-bold"
        >
          {res.percentage >= 70 ? "PASSED WITH DISTINCTION" : "ASSESSMENT COMPLETED"}
        </Badge>

        <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">
          {res.score} <span className="text-2xl text-muted font-normal">/ {res.totalMarks} Marks</span>
        </h2>

        <p className="text-sm text-muted font-mono mb-4">Overall Score Percentage: {res.percentage}%</p>

        <div className="flex justify-center items-center gap-3">
          <Badge variant={res.risk === "High" ? "danger" : res.risk === "Medium" ? "warning" : "success"} dot>
            Integrity Risk: {res.risk}
          </Badge>
          <span className="text-xs text-muted font-mono">•</span>
          <span className="text-xs text-muted font-mono flex items-center gap-1">
            <FiClock className="w-3.5 h-3.5" /> Time Taken: {formatTime(res.timeTaken)}
          </span>
        </div>
      </Card>

      {/* Stat Cards Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Score"
          value={`${res.score} / ${res.totalMarks}`}
          subtext={`${res.percentage}% Total`}
          icon={FiAward}
          variant="primary"
        />
        <StatCard
          title="Correct Questions"
          value={res.correct}
          subtext={`${res.correct} of ${res.total}`}
          icon={FiCheckCircle}
          variant="success"
        />
        <StatCard
          title="Incorrect / Skipped"
          value={res.incorrect}
          subtext={`${res.incorrect} of ${res.total}`}
          icon={FiXCircle}
          variant="danger"
        />
        <StatCard
          title="Security Violations"
          value={res.violations}
          subtext={`Risk Category: ${res.risk}`}
          icon={FiShield}
          variant={res.violations > 3 ? "danger" : "warning"}
        />
      </div>

      {/* Performance Chart & Proctoring Integrity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartWrapper title="Accuracy Breakdown" subtitle="Distribution of correct vs incorrect answers">
          <DonutChart data={chartData} height={220} />
        </ChartWrapper>

        <Card className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <FiAlertTriangle className="text-warning" /> Proctoring Integrity Summary
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Your assessment session was continuously analyzed using AI facial detection, tab visibility monitoring, and audio telemetry.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Proctor Status</span>
                <span className="font-semibold text-success">Verified & Submitted</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Total Security Violations</span>
                <span className="font-bold text-foreground">{res.violations}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted">Integrity Risk Level</span>
                <Badge variant={res.risk === "High" ? "danger" : res.risk === "Medium" ? "warning" : "success"}>
                  {res.risk} Risk
                </Badge>
              </div>
            </div>
          </div>

          <Button variant="primary" className="w-full" icon={FiHome} onClick={() => navigate("/student/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    </div>
  )
}
