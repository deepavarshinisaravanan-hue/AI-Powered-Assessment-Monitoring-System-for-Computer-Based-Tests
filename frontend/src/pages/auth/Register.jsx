import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi"
import Input from "../../components/forms/Input"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import Card from "../../components/ui/Card"
import Logo from "../../components/layout/Logo"
import { useAuth } from "../../context/AuthContext"
import { authService } from "../../services/authService"
import toast from "react-hot-toast"

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Full name is required"
    if (!form.email) e.email = "Email is required"
    if (!form.password) e.password = "Password is required"
    else if (form.password.length < 6) e.password = "Minimum 6 characters"
    if (form.confirm !== form.password) e.confirm = "Passwords do not match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    setSubmitError("")
    if (!validate()) return
    setLoading(true)
    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      })
      const user = await login({
        email: form.email,
        password: form.password,
        role: "student",
      })
      toast.success(`Account created! Welcome, ${form.name || user.name}.`)
      navigate("/student/dashboard", { replace: true })
    } catch (err) {
      setSubmitError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-4">
        <Logo className="justify-center mb-3 text-2xl" />
        <h2 className="text-2xl font-bold text-foreground">Create Student Account</h2>
        <p className="text-sm text-muted mt-1">Register to start proctored examinations.</p>
      </div>

      <Card className="p-6 md:p-8 shadow-lift border-border/80">
        {submitError && (
          <Alert variant="danger" className="mb-5">
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            name="name"
            placeholder="Aarav Sharma"
            icon={FiUser}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="student@proctorx.com"
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
              placeholder="Create password (min 6 chars)"
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

          <Input
            label="Confirm Password"
            name="confirm"
            type={showPw ? "text" : "password"}
            placeholder="Re-enter password"
            icon={FiLock}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            error={errors.confirm}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5"
            loading={loading}
            icon={FiUserPlus}
          >
            Register Student Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
