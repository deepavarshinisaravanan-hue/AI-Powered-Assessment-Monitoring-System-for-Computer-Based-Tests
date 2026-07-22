import { useEffect, useRef, useState } from "react"
import { cn } from "../../utils"

export default function Dropdown({ trigger, items = [], children, align = "right", width = "w-56" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const renderIcon = (Icon) => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      return <Icon className="w-4 h-4 shrink-0" />
    }
    return Icon
  }

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)} className="inline-flex items-center outline-none cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-2 origin-top animate-scale-in rounded-2xl border border-border/80 bg-card p-1.5 shadow-lift",
            width,
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div onClick={() => setOpen(false)}>
            {items && items.length > 0
              ? items.map((item, idx) => {
                  if (item.divider) {
                    return <div key={`div_${idx}`} className="my-1 border-t border-border/60" />
                  }
                  return (
                    <button
                      key={item.label || idx}
                      type="button"
                      onClick={item.onClick}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                        item.danger
                          ? "text-danger hover:bg-danger/10"
                          : "text-foreground hover:bg-muted/10"
                      )}
                    >
                      {renderIcon(item.icon)}
                      {item.label}
                    </button>
                  )
                })
              : children}
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ icon, children, onClick, danger = false }) {
  const renderIcon = (Icon) => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      return <Icon className="w-4 h-4 shrink-0" />
    }
    return Icon
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
        danger ? "text-danger hover:bg-danger/10" : "text-foreground hover:bg-muted/10"
      )}
    >
      {renderIcon(icon)}
      {children}
    </button>
  )
}
