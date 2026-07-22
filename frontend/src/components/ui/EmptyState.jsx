import { FiInbox } from "react-icons/fi"
import { cn } from "../../utils"

export default function EmptyState({ icon, title = "Nothing here yet", message, description, action, className = "" }) {
  const displayMessage = description || message

  const renderIcon = () => {
    if (!icon) return <FiInbox className="h-7 w-7" />
    if (typeof icon === "function") {
      const IconComponent = icon
      return <IconComponent className="h-7 w-7" />
    }
    return icon
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-border/40 text-muted">
        {renderIcon()}
      </span>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {displayMessage && <p className="mt-1 text-sm text-muted max-w-sm">{displayMessage}</p>}
      </div>
      {action}
    </div>
  )
}
