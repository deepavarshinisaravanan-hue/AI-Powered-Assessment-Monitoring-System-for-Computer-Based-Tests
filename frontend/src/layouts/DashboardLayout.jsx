import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/layout/Sidebar"
import Header from "../components/layout/Header"
import { useAuth } from "../context/AuthContext"

export default function DashboardLayout({ role, title }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const resolvedRole = role || user?.role || "student"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={resolvedRole} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
