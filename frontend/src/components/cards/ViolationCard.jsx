import { FiAlertCircle, FiAlertTriangle, FiInfo, FiClock } from "react-icons/fi"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import { formatDateTime } from "../../utils"

export default function ViolationCard({ violation }) {
  const { label, severity, time, details } = violation

  const icons = {
    high: FiAlertCircle,
    medium: FiAlertTriangle,
    low: FiInfo,
  }

  const Icon = icons[severity] || FiAlertCircle

  const colors = {
    high: "text-danger bg-danger/10 border-danger/20",
    medium: "text-warning bg-warning/10 border-warning/20",
    low: "text-secondary bg-secondary/10 border-secondary/20",
  }

  return (
    <Card className="flex items-start gap-3.5 p-3.5 hover:shadow-soft transition-all">
      <div className={`p-2 rounded-xl border ${colors[severity]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-foreground truncate">{label}</h4>
          <Badge
            variant={severity === "high" ? "danger" : severity === "medium" ? "warning" : "info"}
            className="text-[10px] uppercase font-bold"
          >
            {severity}
          </Badge>
        </div>
        {details && <p className="text-xs text-muted mb-1 line-clamp-1">{details}</p>}
        <div className="flex items-center gap-1 text-[11px] text-muted">
          <FiClock className="w-3 h-3" />
          <span>{formatDateTime(time)}</span>
        </div>
      </div>
    </Card>
  )
}
