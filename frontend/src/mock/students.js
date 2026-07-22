export const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Information Technology",
  "Civil",
]

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
]

const statuses = ["Active", "Active", "Active", "Flagged", "Idle"]

export const liveStudents = names.map((name, i) => {
  const violations = Math.floor(Math.random() * 8)
  const status = violations >= 5 ? "Flagged" : statuses[i % statuses.length]
  return {
    id: `live-${i + 1}`,
    name,
    rollNo: `CS21B${String(10 + i).padStart(3, "0")}`,
    department: departments[i % departments.length],
    exam: "DSA — Mid Semester",
    timeLeft: 900 + Math.floor(Math.random() * 900),
    status,
    violations,
    face: Math.random() > 0.1,
    phone: violations >= 5 && Math.random() > 0.5,
    multiplePersons: violations >= 6 && Math.random() > 0.6,
    fullscreen: status !== "Flagged",
    lastActivity: `${Math.floor(Math.random() * 40)}s ago`,
  }
})

export const mockStudentsList = names.map((name, i) => ({
  id: `stu-${i + 1}`,
  name,
  rollNo: `CS21B${String(10 + i).padStart(3, "0")}`,
  department: departments[i % departments.length],
  year: `${(i % 4) + 1}${["st", "nd", "rd", "th"][Math.min(i % 4, 3)]} Year`,
  email: `${name.split(" ")[0].toLowerCase()}@college.edu`,
}))
