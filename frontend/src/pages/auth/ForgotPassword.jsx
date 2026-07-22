import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi"
import Input from "../../components/forms/Input"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import Logo from "../../components/layout/Logo"
import toast from "react-hot-toast"

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "" },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast.success("Password reset instructions sent to your email!")
    }, 800)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-4">
        <Logo className="justify-center mb-3 text-2xl" />
        <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
        <p className="text-sm text-muted mt-1">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <Card className="p-6 md:p-8 shadow-lift border-border/80">
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
            <p className="text-xs text-muted leading-relaxed">
              We've sent password reset instructions to your email. Please check your inbox and follow the link.
            </p>
            <Link to="/login" className="block pt-2">
              <Button variant="outline" className="w-full" icon={FiArrowLeft}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. student@proctorx.com"
              icon={FiMail}
              error={errors.email?.message}
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              loading={loading}
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs text-muted hover:text-foreground font-medium transition-colors"
              >
                <FiArrowLeft className="mr-1" /> Return to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
