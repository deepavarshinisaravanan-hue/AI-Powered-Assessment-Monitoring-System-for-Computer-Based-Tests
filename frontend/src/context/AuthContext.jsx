import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "../services/authService"
import { STORAGE_KEYS } from "../constants"
import { storage } from "../utils"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore persistent login on mount.
  useEffect(() => {
    const saved = storage(STORAGE_KEYS.AUTH).get()
    if (saved?.user && saved?.token) {
      setUser(saved.user)
      setToken(saved.token)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const { user: u, token: t } = await authService.login(credentials)
    setUser(u)
    setToken(t)
    if (credentials.remember !== false) {
      storage(STORAGE_KEYS.AUTH).set({ user: u, token: t })
    }
    return u
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
    storage(STORAGE_KEYS.AUTH).remove()
    storage(STORAGE_KEYS.EXAM_STATE).remove()
  }

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch }
      const saved = storage(STORAGE_KEYS.AUTH).get()
      if (saved) storage(STORAGE_KEYS.AUTH).set({ ...saved, user: next })
      return next
    })
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated: !!user, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
