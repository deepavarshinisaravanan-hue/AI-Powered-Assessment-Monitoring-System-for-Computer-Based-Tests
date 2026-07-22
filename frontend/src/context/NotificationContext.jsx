import { createContext, useContext, useState, useCallback } from "react"
import { notifications as seed } from "../mock/data"
import { uid } from "../utils"

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [items, setItems] = useState(seed)

  const unread = items.filter((n) => !n.read).length

  const addNotification = useCallback((notif) => {
    setItems((prev) => [
      { id: uid("n"), time: "just now", read: false, type: "info", ...notif },
      ...prev,
    ])
  }, [])

  const markRead = useCallback((id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{ items, unread, addNotification, markRead, markAllRead, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider")
  return ctx
}
