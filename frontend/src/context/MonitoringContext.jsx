import { createContext, useContext, useState, useCallback, useRef } from "react"
import toast from "react-hot-toast"
import { VIOLATION_TYPES, STORAGE_KEYS } from "../constants"
import { storage, uid } from "../utils"

const MonitoringContext = createContext(null)

const initialStatus = {
  face: true,
  phone: false,
  multiplePersons: false,
  browser: true,
  fullscreen: true,
}

export function MonitoringProvider({ children }) {
  const [status, setStatus] = useState(initialStatus)
  const [violations, setViolations] = useState(() => storage(STORAGE_KEYS.VIOLATIONS).get([]))
  const lastToast = useRef({})

  const persist = (list) => storage(STORAGE_KEYS.VIOLATIONS).set(list)

  const logViolation = useCallback((typeKey) => {
    const meta = VIOLATION_TYPES.find((v) => v.key === typeKey)
    if (!meta) return

    // Throttle duplicate toasts of the same type within 4s.
    const now = Date.now()
    if (lastToast.current[typeKey] && now - lastToast.current[typeKey] < 4000) return
    lastToast.current[typeKey] = now

    const entry = {
      id: uid("v"),
      type: typeKey,
      label: meta.label,
      severity: meta.severity,
      time: new Date().toISOString(),
    }

    setViolations((prev) => {
      const next = [entry, ...prev].slice(0, 200)
      persist(next)
      return next
    })

    toast(meta.label, {
      icon: meta.severity === "high" ? "\u26D4" : meta.severity === "medium" ? "\u26A0\uFE0F" : "\u2139\uFE0F",
      style: {
        borderLeft: `4px solid ${
          meta.severity === "high" ? "#EF4444" : meta.severity === "medium" ? "#F59E0B" : "#3B82F6"
        }`,
      },
    })
  }, [])

  const updateStatus = useCallback((patch) => {
    setStatus((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetMonitoring = useCallback(() => {
    setStatus(initialStatus)
    setViolations([])
    storage(STORAGE_KEYS.VIOLATIONS).remove()
  }, [])

  return (
    <MonitoringContext.Provider
      value={{ status, violations, violationCount: violations.length, logViolation, updateStatus, resetMonitoring }}
    >
      {children}
    </MonitoringContext.Provider>
  )
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext)
  if (!ctx) throw new Error("useMonitoring must be used within MonitoringProvider")
  return ctx
}
