import { useEffect, useState, useCallback } from "react"

export function useFullscreen(onExit) {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement
  )

  const enter = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen?.()
    } catch {
      /* user denied or unsupported */
    }
  }, [])

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.()
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) onExit?.()
    }
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [onExit])

  return { isFullscreen, enter, exit }
}
