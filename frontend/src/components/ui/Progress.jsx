import { cn } from "../../utils"

const barTones = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  secondary: "bg-secondary",
}

export default function Progress({ value = 0, max = 100, tone = "primary", showLabel = false, className = "" }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={className}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barTones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-right text-xs text-muted">{pct}%</p>}
    </div>
  )
}
