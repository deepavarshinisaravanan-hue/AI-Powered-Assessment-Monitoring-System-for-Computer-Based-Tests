import { cn } from "../../utils"

const barTones = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

export default function BarChart({ data = [], tone = "primary", height = 200 }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn(
                "group relative w-full rounded-t-lg transition-all duration-700 ease-out hover:brightness-110",
                barTones[d.color || tone]
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-dark px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {d.value}
              </span>
            </div>
          </div>
          <span className="truncate text-xs text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
