const colorMap = {
  primary: "#2563EB",
  secondary: "#3B82F6",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
}

export default function DonutChart({ data = [], size = 180 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const radius = size / 2 - 14
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-border" strokeWidth="14" />
          {data.map((d) => {
            const dash = (d.value / total) * circumference
            const seg = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colorMap[d.color] || colorMap.primary}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )
            offset += dash
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ background: colorMap[d.color] || colorMap.primary }} />
            <span className="text-muted">{d.label}</span>
            <span className="ml-auto font-medium text-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
