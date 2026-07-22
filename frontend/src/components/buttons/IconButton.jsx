import { cn } from "../../utils"

export default function IconButton({
  icon: Icon,
  variant = "ghost",
  size = "md",
  title,
  onClick,
  className,
  disabled = false,
  badge = null,
  ...props
}) {
  const base =
    "relative inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    ghost: "text-muted hover:text-foreground hover:bg-muted/10",
    outline: "border border-border text-foreground hover:bg-muted/10",
    danger: "bg-danger/10 text-danger hover:bg-danger/20",
  }

  const sizes = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base",
    lg: "p-2.5 text-lg",
  }

  const renderIcon = () => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      return <Icon className="w-5 h-5" />
    }
    return Icon
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {renderIcon()}
      {badge && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm animate-scale-in">
          {badge}
        </span>
      )}
    </button>
  )
}
