import { FiAlertOctagon, FiX } from "react-icons/fi"
import Button from "../ui/Button"

export default function ViolationAlert({ violation, onDismiss }) {
  if (!violation) return null

  const isHigh = violation.severity === "high"

  return (
    <div
      className={`fixed top-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl shadow-lift border animate-slide-in-right ${
        isHigh
          ? "bg-danger text-white border-danger/60"
          : "bg-warning text-dark border-warning/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/20">
          <FiAlertOctagon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm uppercase tracking-wide">
            Violation Warning ({violation.severity})
          </h4>
          <p className="text-xs mt-1 opacity-90">{violation.label}</p>
          <p className="text-[11px] mt-1 font-mono opacity-80">
            Recorded at: {new Date(violation.time).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
