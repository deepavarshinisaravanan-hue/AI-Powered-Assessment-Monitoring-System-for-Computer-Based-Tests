import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserCheck } from "react-icons/fi"
import Input from "../../components/forms/Input"
import Checkbox from "../../components/forms/Checkbox"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import Card from "../../components/ui/Card"
import Logo from "../../components/layout/Logo"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"

const demoAccounts = [
  { role: "student", label: "Student", email: "student@example.com", password: "student123" },
  { role: "admin", label: "Admin", email: "admin@example.com", password: "admin123" },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [role, setRole] = useState("student")
  const [form, setForm] = useState({ email: "student@example.com", password: "student123", remember: true })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = "Email is required"
    if (!form.password) e.password = "Password is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    setSubmitError("")
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login({ ...form, role })
      toast.success(`Welcome back, ${user.name}!`)
      const from = location.state?.from?.pathname
      const home = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"
      navigate(from || home, { replace: true })
    } catch (err) {
      setSubmitError(err.message || "Invalid credentials for selected role")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc) => {
    setRole(acc.role)
    setForm({ email: acc.email, password: acc.password, remember: true })
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-4">
        <Logo className="justify-center mb-3 text-2xl" />
        <h2 className="text-2xl font-bold text-foreground">Sign in to ProctorX</h2>
        <p className="text-sm text-muted mt-1">
          Access your secure computer-based assessment portal.
        </p>
      </div>

      <Card className="p-6 md:p-8 shadow-lift border-border/80">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 mb-6 rounded-xl bg-muted/20 border border-border/60">
          {demoAccounts.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => {
                setRole(acc.role)
                fillDemo(acc)
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === acc.role
                  ? "bg-card text-foreground shadow-soft border border-border/60"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <FiUserCheck className="inline mr-1.5" />
              {acc.label} Login
            </button>
          ))}
        </div>

        {submitError && (
          <Alert variant="danger" className="mb-5">
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@proctorx.com"
            icon={FiMail}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="Enter password"
              icon={FiLock}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-9 text-muted hover:text-foreground p-1"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              label="Remember me"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            />
            <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            loading={loading}
            icon={FiLogIn}
          >
            Sign in as {role === "admin" ? "Administrator" : "Student"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create Student Account
          </Link>
        </p>

        {/* Quick Demo Credentials helper */}
        <div className="mt-6 pt-4 border-t border-border/60">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className="p-2 rounded-xl border border-border/80 bg-muted/10 text-left hover:bg-primary/5 transition-colors"
              >
                <span className="font-bold text-foreground block">{acc.label} Demo</span>
                <span className="text-[10px] text-muted font-mono block truncate">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
