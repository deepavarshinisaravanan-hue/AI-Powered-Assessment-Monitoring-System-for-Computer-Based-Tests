import { Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "../layouts/AuthLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import ExamLayout from "../layouts/ExamLayout"

import ProtectedRoute from "./ProtectedRoute"
import RoleRoute from "./RoleRoute"

import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import ForgotPassword from "../pages/auth/ForgotPassword"

import StudentDashboard from "../pages/student/StudentDashboard"
import ExamInstructions from "../pages/student/ExamInstructions"
import ExaminationPage from "../pages/student/ExaminationPage"
import ResultPage from "../pages/student/ResultPage"

import AdminDashboard from "../pages/admin/AdminDashboard"
import LiveMonitoringPage from "../pages/admin/LiveMonitoringPage"
import ReportsPage from "../pages/admin/ReportsPage"
import StudentDetailsPage from "../pages/admin/StudentDetailsPage"

import ProfilePage from "../pages/common/ProfilePage"
import NotFoundPage from "../pages/common/NotFoundPage"
import { useAuth } from "../context/AuthContext"

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuth()

  // Root redirect logic based on authenticated role
  const getDefaultHome = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/student/dashboard" replace />
    )
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getDefaultHome()} />

      {/* Auth Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Student Protected Routes (Dashboard Layout) */}
      <Route
        element={
          <RoleRoute allowedRoles={["student"]}>
            <DashboardLayout role="student" title="Student Portal" />
          </RoleRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/instructions" element={<ExamInstructions />} />
        <Route path="/student/result" element={<ResultPage />} />
      </Route>

      {/* Examination Secure Layout (No sidebar) */}
      <Route
        element={
          <RoleRoute allowedRoles={["student"]}>
            <ExamLayout />
          </RoleRoute>
        }
      >
        <Route path="/student/exam" element={<ExaminationPage />} />
      </Route>

      {/* Admin Protected Routes (Dashboard Layout) */}
      <Route
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <DashboardLayout role="admin" title="Admin Monitoring Console" />
          </RoleRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/monitoring" element={<LiveMonitoringPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/student/:id" element={<StudentDetailsPage />} />
      </Route>

      {/* Common Authenticated Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout title="User Profile" />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
