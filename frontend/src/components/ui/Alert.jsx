import { FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle } from "react-icons/fi"
import { cn } from "../../utils"

const config = {
  info: { icon: FiInfo, cls: "bg-primary/10 text-primary border-primary/20" },
  success: { icon: FiCheckCircle, cls: "bg-success/10 text-success border-success/20" },
  warning: { icon: FiAlertTriangle, cls: "bg-warning/10 text-[#b45309] border-warning/20" },
  danger: { icon: FiXCircle, cls: "bg-danger/10 text-danger border-danger/20" },
}

export default function Alert({ type = "info", title, children, className = "" }) {
  const { icon: Icon, cls } = config[type]
  return (
    <div className={cn("flex gap-3 rounded-xl border p-3.5", cls, className)} role="alert">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="mt-0.5 opacity-90">{children}</div>}
      </div>
    </div>
  )
}
