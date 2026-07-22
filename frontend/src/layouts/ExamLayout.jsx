import { Outlet } from "react-router-dom"
import Logo from "../components/layout/Logo"
import ThemeToggle from "../components/layout/ThemeToggle"
import Badge from "../components/ui/Badge"
import { FiShield } from "react-icons/fi"

export default function ExamLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background select-none">
      {/* Exam Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-card border-b border-border/80 shadow-soft">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:inline text-xs font-mono text-muted border-l border-border pl-3">
            Computer-Based Testing Environment
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="danger" dot className="animate-pulse">
            <FiShield className="inline mr-1" /> Anti-Cheat Shield Active
          </Badge>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto animate-fade-in">
        <Outlet />
      </main>

      {/* Minimal Exam Footer */}
      <footer className="py-2.5 px-6 border-t border-border/60 bg-card/50 text-center text-xs text-muted">
        ProctorX Monitoring System • Secure Assessment Session
      </footer>
    </div>
  )
}
