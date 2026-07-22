import { useEffect } from "react"

// Attaches listeners for common cheating attempts and reports them via onViolation(typeKey).
export function useAntiCheat(active, onViolation) {
  useEffect(() => {
    if (!active) return

    const onVisibility = () => {
      if (document.hidden) onViolation("tab")
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
    const onBlur = () => onViolation("tab")

    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("contextmenu", onContextMenu)
    document.addEventListener("copy", onCopy)
    document.addEventListener("paste", onPaste)
    window.addEventListener("blur", onBlur)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("contextmenu", onContextMenu)
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("paste", onPaste)
      window.removeEventListener("blur", onBlur)
    }
  }, [active, onViolation])
}
