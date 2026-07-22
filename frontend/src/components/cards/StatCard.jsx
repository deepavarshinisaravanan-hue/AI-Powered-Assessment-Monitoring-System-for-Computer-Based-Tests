import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi"
import { cn } from "../../utils"

const toneMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  secondary: "bg-secondary/10 text-secondary",
}

export default function StatCard({
  title,
  label,
  value,
  subtext,
  icon: Icon,
  variant,
  tone = "primary",
  trend,
  trendUp = true,
}) {
  const displayLabel = title || label
  const displayTone = variant || tone
  const displaySubtext = subtext

  const renderIcon = () => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      return <Icon className="w-5 h-5" />
    }
    return Icon
  }

  return (
    <div className="group rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", toneMap[displayTone] || toneMap.primary)}>
          {renderIcon()}
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trendUp ? "text-success" : "text-danger"
            )}
          >
            {trendUp ? <FiArrowUpRight /> : <FiArrowDownRight />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground/80">{displayLabel}</p>
      {displaySubtext && <p className="mt-0.5 text-xs text-muted font-mono">{displaySubtext}</p>}
    </div>
  )
}
