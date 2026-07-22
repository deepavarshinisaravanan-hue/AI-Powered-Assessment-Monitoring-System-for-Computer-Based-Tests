import { forwardRef } from "react"
import { FiCheck } from "react-icons/fi"
import { cn } from "../../utils"

const Checkbox = forwardRef(function Checkbox({ label, className = "", id, checked, ...props }, ref) {
  const inputId = id || props.name
  return (
    <label htmlFor={inputId} className={cn("flex cursor-pointer items-center gap-2.5 select-none", className)}>
      <span className="relative flex h-5 w-5 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-card transition-all checked:border-primary checked:bg-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          {...props}
        />
        <FiCheck className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  )
})

export default Checkbox
