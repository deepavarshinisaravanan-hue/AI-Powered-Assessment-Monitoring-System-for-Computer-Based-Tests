import { cn } from "../../utils"

export default function Logo({ collapsed = false, size = "md", className = "" }) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }

  return (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* High-Impact AI Proctor Shield Emblem */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105",
          iconSizes[size]
        )}
      >
        {/* Animated outer aura pulse */}
        <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 opacity-40 blur-sm group-hover:opacity-75 transition-opacity" />

        {/* Custom Proctor Eye Shield SVG */}
        <svg
          className="relative z-10 w-3/5 h-3/5 drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Security Shield Path */}
          <path
            d="M12 2L4 5V11.5C4 16.5 7.5 20.8 12 22C16.5 20.8 20 16.5 20 11.5V5L12 2Z"
            className="stroke-white stroke-[2]"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#shield-gradient)"
          />
          {/* Inner AI Camera Lens Core */}
          <circle cx="12" cy="11.5" r="3.5" className="fill-white" />
          <circle cx="12" cy="11.5" r="1.5" className="fill-primary" />
          {/* Scanning Radar Ping */}
          <circle cx="12" cy="11.5" r="5" className="stroke-white/60 stroke-[1.2]" strokeDasharray="2 2" />

          <defs>
            <linearGradient id="shield-gradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="1" stopColor="#1D4ED8" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Live Active Status Indicator Dot */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-card" />
        </span>
      </div>

      {/* Brand Typography */}
      {!collapsed && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            <span className={cn("font-black tracking-tight text-foreground font-sans", textSizes[size])}>
              PROCTOR
            </span>
            <span className={cn("font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500", textSizes[size])}>
              X
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            AI Proctoring Suite
          </span>
        </div>
      )}
    </div>
  )
}
