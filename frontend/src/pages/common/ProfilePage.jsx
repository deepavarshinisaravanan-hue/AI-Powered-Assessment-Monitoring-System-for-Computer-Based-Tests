import { useState } from "react"
import { useForm } from "react-hook-form"
import PageHeader from "../../components/common/PageHeader"
import Card from "../../components/ui/Card"
import Input from "../../components/forms/Input"
import Button from "../../components/ui/Button"
import Avatar from "../../components/ui/Avatar"
import Modal from "../../components/ui/Modal"
import ThemeToggle from "../../components/layout/ThemeToggle"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { authService } from "../../services/authService"
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiEdit2, FiMoon, FiSun, FiLogOut } from "react-icons/fi"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const { theme } = useTheme()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pwModal, setPwModal] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
      year: user?.year || "",
    },
  })

  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm()

  const onUpdateProfile = async (values) => {
    setLoading(true)
    try {
      await authService.updateProfile(values)
      updateUser(values)
      toast.success("Profile details updated successfully!")
      setEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New password and confirmation do not match!")
      return
    }
    setPwLoading(true)
    setTimeout(() => {
      setPwLoading(false)
      setPwModal(false)
      resetPw()
      toast.success("Password updated successfully!")
    }, 700)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Account & System Preferences"
        description="Manage your profile metadata, authentication credentials, and user interface preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Avatar Card */}
        <Card className="p-6 text-center space-y-4">
          <Avatar name={user?.name} size="xl" className="mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
            <p className="text-xs text-muted capitalize">{user?.role} Account</p>
            {user?.rollNo && <p className="text-xs text-muted font-mono mt-1">{user.rollNo}</p>}
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              icon={FiEdit2}
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Cancel Edit" : "Edit Profile Details"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted"
              icon={FiLock}
              onClick={() => setPwModal(true)}
            >
              Change Password
            </Button>

            <Button
              variant="danger"
              size="sm"
              className="w-full text-xs"
              icon={FiLogOut}
              onClick={logout}
            >
              Log Out
            </Button>
          </div>
        </Card>

        {/* Right Form & Preferences (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <FiUser className="text-primary" /> Personal Information
            </h3>

            <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  disabled={!editing}
                  error={errors.name?.message}
                  {...register("name", { required: "Name is required" })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  disabled={!editing}
                  error={errors.email?.message}
                  {...register("email", { required: "Email is required" })}
                />
                <Input
                  label="Phone Number"
                  disabled={!editing}
                  {...register("phone")}
                />
                <Input
                  label="Department"
                  disabled={!editing}
                  {...register("department")}
                />
              </div>

              {editing && (
                <div className="flex justify-end pt-2">
                  <Button variant="primary" loading={loading} icon={FiCheckCircle}>
                    Save Profile Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              {theme === "dark" ? <FiMoon className="text-primary" /> : <FiSun className="text-warning" />} Theme Preferences
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Appearance Mode</p>
                <p className="text-xs text-muted">Switch between dark mode and light mode theme</p>
              </div>
              <ThemeToggle />
            </div>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={pwModal}
        onClose={() => setPwModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            error={pwErrors.currentPassword?.message}
            {...regPw("currentPassword", { required: "Current password is required" })}
          />
          <Input
            label="New Password"
            type="password"
            error={pwErrors.newPassword?.message}
            {...regPw("newPassword", { required: "New password is required", minLength: { value: 6, message: "Min 6 chars" } })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={pwErrors.confirmPassword?.message}
            {...regPw("confirmPassword", { required: "Please confirm password" })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPwModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={pwLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
