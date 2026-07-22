import { cn } from "../../utils"

export default function Card({ children, className = "", hover = false, glass = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-soft transition-all duration-300",
        glass && "glass",
        hover && "hover:-translate-y-0.5 hover:shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-border px-5 py-4", className)}>
      <div>
        <h3 className="text-base font-semibold text-foreground text-balance">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ children, className = "" }) {
  return <div className={cn("p-5", className)}>{children}</div>
}
