import { useEffect } from "react"

// Attaches listeners for common cheating attempts and reports them via onViolation(typeKey).
export function useAntiCheat(active, onViolation) {
  useEffect(() => {
    if (!active) return

    let blurTimeout = null
    let lastFocusLoss = 0

    const onVisibility = () => {
      if (document.hidden) {
        lastFocusLoss = Date.now()
        if (blurTimeout !== null) {
          window.clearTimeout(blurTimeout)
          blurTimeout = null
        }
        onViolation("tab")
      }
    }

    const onContextMenu = (e) => {
      e.preventDefault()
      onViolation("rightclick")
    }

    const onCopy = (e) => {
      e.preventDefault()
      onViolation("copy")
    }

    const onPaste = (e) => {
      e.preventDefault()
      onViolation("paste")
    }

    const onBlur = () => {
      if (document.hidden) return
      if (blurTimeout !== null) window.clearTimeout(blurTimeout)
      blurTimeout = window.setTimeout(() => {
        blurTimeout = null
        if (!document.hidden && Date.now() - lastFocusLoss >= 250) {
          lastFocusLoss = Date.now()
          onViolation("window_blur")
        }
      }, 250)
    }

    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("contextmenu", onContextMenu)
    document.addEventListener("copy", onCopy)
    document.addEventListener("paste", onPaste)
    window.addEventListener("blur", onBlur)

    return () => {
      if (blurTimeout !== null) window.clearTimeout(blurTimeout)
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("contextmenu", onContextMenu)
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("paste", onPaste)
      window.removeEventListener("blur", onBlur)
    }
  }, [active, onViolation])
}