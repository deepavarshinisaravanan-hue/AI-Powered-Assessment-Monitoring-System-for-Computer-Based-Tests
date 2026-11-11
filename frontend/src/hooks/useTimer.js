import { useEffect, useRef, useState } from "react"

export function useTimer(initialSeconds, onExpire, enabled = true) {
  const safeInitialSeconds = Number.isFinite(initialSeconds)
    ? Math.max(0, Math.floor(initialSeconds))
    : 0
  const [seconds, setSeconds] = useState(safeInitialSeconds)
  const [running, setRunning] = useState(true)
  const expiredRef = useRef(false)

  useEffect(() => {
    setSeconds(safeInitialSeconds)
    expiredRef.current = false
  }, [safeInitialSeconds])

  useEffect(() => {
    if (!running || !enabled || safeInitialSeconds <= 0) return
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire?.()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, enabled, onExpire, safeInitialSeconds])

  return { seconds, running, setRunning }
}
