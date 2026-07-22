import { forwardRef } from "react"
import { cn } from "../../utils"

const Textarea = forwardRef(function Textarea(
  { label, error, className = "", id, rows = 4, ...props },
  ref
) {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          "w-full resize-none rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted/70",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          error ? "border-danger" : "border-border",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
})

export default Textarea
