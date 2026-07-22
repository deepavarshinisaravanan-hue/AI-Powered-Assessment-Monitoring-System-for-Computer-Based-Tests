import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Loader from "../components/ui/Loader"

export default function RoleRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) return <Loader fullscreen label="Verifying access authorization..." />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const fallback = user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard"
    return <Navigate to={fallback} replace />
  }

  return children
}
