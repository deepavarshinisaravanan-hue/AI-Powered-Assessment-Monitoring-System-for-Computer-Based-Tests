import { departments } from "./students"
import { computeRisk } from "../utils"

const names = [
  "Aarav Sharma",
  "Diya Patel",
  "Vivaan Reddy",
  "Ananya Nair",
  "Ishaan Gupta",
  "Saanvi Rao",
  "Reyansh Menon",
  "Aadhya Krishnan",
  "Kabir Malhotra",
  "Myra Joshi",
  "Arjun Verma",
  "Kiara Bhat",
  "Advait Sinha",
  "Zara Khan",
  "Aryan Das",
  "Navya Pillai",
  "Dhruv Shah",
  "Anika Roy",
  "Kian Mehta",
  "Prisha Kaur",
]

export const mockReports = names.map((name, i) => {
  const violations = Math.floor(Math.random() * 9)
  const score = 8 + Math.floor(Math.random() * 13)
  const risk = computeRisk(violations)
  const statuses = ["Completed", "Completed", "Flagged", "Completed"]
  return {
    id: `rep-${1000 + i}`,
    name,
    rollNo: `CS21B${String(10 + i).padStart(3, "0")}`,
    department: departments[i % departments.length],
    exam: "DSA — Mid Semester",
    date: new Date(Date.now() - i * 86400000 * 0.4).toISOString(),
    score,
    total: 20,
    percentage: Math.round((score / 20) * 100),
    violations,
    risk,
    status: risk === "High" ? "Flagged" : statuses[i % statuses.length],
    timeTaken: `${20 + Math.floor(Math.random() * 10)} min`,
  }
})

export const dashboardStats = {
  totalStudents: 1284,
  runningExams: 42,
  completedExams: 968,
  violations: 137,
}

export const violationSummary = [
  { label: "Phone", value: 34, color: "danger" },
  { label: "Multi-Face", value: 22, color: "danger" },
  { label: "Tab Switch", value: 41, color: "warning" },
  { label: "No Face", value: 25, color: "warning" },
  { label: "Fullscreen", value: 15, color: "secondary" },
]

export const performanceData = [
  { label: "0-40%", value: 6 },
  { label: "41-60%", value: 14 },
  { label: "61-75%", value: 28 },
  { label: "76-90%", value: 41 },
  { label: "91-100%", value: 19 },
]

export const weeklyExams = [
  { label: "Mon", value: 32 },
  { label: "Tue", value: 48 },
  { label: "Wed", value: 41 },
  { label: "Thu", value: 66 },
  { label: "Fri", value: 55 },
  { label: "Sat", value: 28 },
  { label: "Sun", value: 12 },
]

export const recentActivities = [
  { id: 1, text: "Aarav Sharma started DSA — Mid Semester", time: "2m ago", type: "info" },
  { id: 2, text: "Phone detected for Kabir Malhotra", time: "5m ago", type: "danger" },
  { id: 3, text: "Diya Patel submitted the exam", time: "11m ago", type: "success" },
  { id: 4, text: "Multiple faces flagged for Ishaan Gupta", time: "18m ago", type: "danger" },
  { id: 5, text: "New exam 'OS Quiz' scheduled", time: "34m ago", type: "info" },
  { id: 6, text: "Saanvi Rao exited fullscreen", time: "42m ago", type: "warning" },
]

export const previousAttempts = [
  { id: "a1", exam: "Operating Systems Quiz", date: "2026-06-28", score: 17, total: 20, risk: "Low" },
  { id: "a2", exam: "DBMS Unit Test", date: "2026-06-14", score: 15, total: 20, risk: "Medium" },
  { id: "a3", exam: "Networks Assessment", date: "2026-05-30", score: 19, total: 20, risk: "Low" },
]

export const performanceTrend = [
  { label: "Feb", value: 72 },
  { label: "Mar", value: 78 },
  { label: "Apr", value: 68 },
  { label: "May", value: 85 },
  { label: "Jun", value: 88 },
  { label: "Jul", value: 91 },
]

export const notifications = [
  { id: "n1", title: "Upcoming Exam", message: "DSA — Mid Semester starts in 2 hours.", time: "1h ago", read: false, type: "info" },
  { id: "n2", title: "Result Published", message: "Your Operating Systems Quiz result is available.", time: "3h ago", read: false, type: "success" },
  { id: "n3", title: "System Check", message: "Please verify your webcam before the exam.", time: "1d ago", read: true, type: "warning" },
]
