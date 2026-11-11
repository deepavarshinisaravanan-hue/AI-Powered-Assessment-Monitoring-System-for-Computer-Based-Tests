export const APP_NAME = "ProctorX"

export const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
}

export const STORAGE_KEYS = {
  AUTH: "proctorx_auth",
  THEME: "proctorx_theme",
  VIOLATIONS: "proctorx_violations",
  EXAM_STATE: "proctorx_exam_state",
}

export const RISK_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

export const EXAM_STATUS = {
  RUNNING: "Running",
  COMPLETED: "Completed",
  UPCOMING: "Upcoming",
  FLAGGED: "Flagged",
}

export const VIOLATION_TYPES = [
  { key: "phone", label: "Mobile Phone Detected", severity: "high" },
  { key: "multiface", label: "Multiple Faces Detected", severity: "high" },
  { key: "fullscreen", label: "Fullscreen Exited", severity: "medium" },
  { key: "tab", label: "Tab Changed", severity: "medium" },
  { key: "window_blur", label: "Window Focus Lost", severity: "medium" },
  { key: "camera_off", label: "Camera Unavailable", severity: "high" },
  { key: "screen_share_stopped", label: "Screen Sharing Stopped", severity: "high" },
  { key: "noface", label: "No Face Detected", severity: "medium" },
  { key: "rightclick", label: "Right Click Attempt", severity: "low" },
  { key: "copy", label: "Copy Attempt", severity: "low" },
  { key: "paste", label: "Paste Attempt", severity: "low" },
]

export const NAV_STUDENT = [
  { label: "Dashboard", path: "/student/dashboard", icon: "dashboard" },
  { label: "Instructions", path: "/student/instructions", icon: "clipboard" },
  { label: "Results", path: "/student/result", icon: "chart" },
  { label: "Profile", path: "/profile", icon: "user" },
]

export const NAV_ADMIN = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
  { label: "Live Monitoring", path: "/admin/monitoring", icon: "video" },
  { label: "Reports", path: "/admin/reports", icon: "report" },
  { label: "Profile", path: "/profile", icon: "user" },
]
