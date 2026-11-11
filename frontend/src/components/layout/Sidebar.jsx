import { NavLink } from "react-router-dom"
import {
  FiGrid,
  FiVideo,
  FiFileText,
  FiUser,
  FiClipboard,
  FiX,
  FiAward,
  FiLogOut,
  FiPlusCircle,
} from "react-icons/fi"
import Logo from "./Logo"
import { cn } from "../../utils"
import { useAuth } from "../../context/AuthContext"

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/admin/assessments/create", label: "Create Assessment", icon: FiPlusCircle },
  { to: "/admin/monitoring", label: "Live Monitoring", icon: FiVideo },
  { to: "/admin/reports", label: "Reports", icon: FiFileText },
  { to: "/profile", label: "Profile", icon: FiUser },
]

const studentNav = [
  { to: "/student/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/student/instructions", label: "Instructions", icon: FiClipboard },
  { to: "/student/result", label: "Results", icon: FiAward },
  { to: "/profile", label: "Profile", icon: FiUser },
]

export default function Sidebar({ role = "admin", open, onClose }) {
  const { logout } = useAuth()
  const nav = role === "admin" || role === "faculty" ? adminNav : studentNav

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-dark/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/80 bg-card transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/80 px-5">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-muted hover:text-foreground lg:hidden"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted">
            {role === "admin" ? "Administration" : "Student Portal"}
          </p>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted hover:bg-muted/10 hover:text-foreground"
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/80 p-4 space-y-3">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs font-bold text-foreground">Anti-Cheat Proctoring</p>
            <p className="mt-1 text-[11px] text-muted">
              AI continuous telemetry active.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2.5 text-xs font-bold text-danger transition-colors hover:bg-danger/20"
          >
            <FiLogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  )
}
