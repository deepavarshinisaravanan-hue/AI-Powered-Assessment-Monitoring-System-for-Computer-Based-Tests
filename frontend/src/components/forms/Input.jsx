import { forwardRef } from "react"
import { cn } from "../../utils"

const Input = forwardRef(function Input(
  { label, error, icon: Icon, rightElement, className = "", id, ...props },
  ref
) {
  const inputId = id || props.name

  const renderIcon = () => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      const IconComp = Icon
      return <IconComp className="w-4 h-4 shrink-0" />
    }
    return Icon
  }

  const renderRight = () => {
    if (!rightElement) return null
    if (typeof rightElement === "function") {
      const RightComp = rightElement
      return <RightComp />
    }
    return rightElement
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {renderIcon()}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border bg-card px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted/70",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            Icon && "pl-10",
            rightElement && "pr-11",
            error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border",
            className
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {renderRight()}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
})

export default Input
