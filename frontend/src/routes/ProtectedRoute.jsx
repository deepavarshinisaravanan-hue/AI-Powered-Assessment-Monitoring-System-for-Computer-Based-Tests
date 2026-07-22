import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Loader from "../components/ui/Loader"

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader fullscreen label="Loading your workspace..." />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    const home = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"
    return <Navigate to={home} replace />
  }

  return children
}
