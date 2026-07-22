import { useState, useRef, useEffect } from "react"
import { FiBell, FiCheck } from "react-icons/fi"
import { useNotifications } from "../../context/NotificationContext"
import { cn } from "../../utils"

export default function NotificationBell() {
  const { items = [], unread = 0, markAllRead, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition-colors hover:text-foreground"
      >
        <FiBell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right animate-scale-in rounded-2xl border border-border/80 bg-card p-2 shadow-lift">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
            <span className="text-xs font-bold text-foreground">Notifications</span>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <FiCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1 pt-1">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted">No notifications</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex w-full flex-col items-start p-2.5 rounded-xl text-left transition-colors",
                    !n.read ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/10"
                  )}
                >
                  <span className="text-xs font-bold text-foreground">{n.title}</span>
                  <span className="text-xs text-muted mt-0.5">{n.message}</span>
                  <span className="mt-1 text-[10px] text-muted font-mono">{n.time}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
