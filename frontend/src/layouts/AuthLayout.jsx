import { Outlet } from "react-router-dom"
import { FiShield, FiClock, FiBarChart2 } from "react-icons/fi"
import Logo from "../components/layout/Logo"

const features = [
  { icon: FiShield, title: "Secure Proctoring", desc: "AI-assisted anti-cheat monitoring in real time." },
  { icon: FiClock, title: "Timed Assessments", desc: "Auto-submit, warnings, and full-screen enforcement." },
  { icon: FiBarChart2, title: "Instant Analytics", desc: "Detailed reports and performance insights." },
]

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Logo className="[&_span]:text-primary-foreground [&_.text-muted]:text-primary-foreground/70" />
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-balance">
            Conduct online exams with confidence.
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            A complete proctoring platform for secure, fair, and insightful online assessments.
          </p>
          <div className="mt-10 space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-primary-foreground/70">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} ProctorX. All rights reserved.
        </p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
