import { cn } from "../../utils"
import Spinner from "./Spinner"

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft",
  secondary: "bg-secondary text-secondary-foreground hover:bg-primary shadow-soft",
  success: "bg-success text-primary-foreground hover:brightness-95 shadow-soft",
  danger: "bg-danger text-danger-foreground hover:brightness-95 shadow-soft",
  warning: "bg-warning text-dark hover:brightness-95 shadow-soft",
  outline:
    "border border-border bg-card text-foreground hover:bg-background hover:border-primary/40",
  ghost: "text-foreground hover:bg-border/40",
  subtle: "bg-primary/10 text-primary hover:bg-primary/20",
}

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2",
  icon: "h-10 w-10",
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon = null,
  className = "",
  type = "button",
  ...props
}) {
  const renderIcon = () => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      return <Icon className="w-4 h-4 shrink-0" />
    }
    return Icon
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={16} className="text-current" /> : renderIcon()}
      {children}
    </button>
  )
}
