import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import { MonitoringProvider } from "./context/MonitoringContext"
import { ExamProvider } from "./context/ExamContext"
import AppRoutes from "./routes/AppRoutes"

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <MonitoringProvider>
              <ExamProvider>
                <AppRoutes />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "var(--color-card)",
                      color: "var(--color-foreground)",
                      borderRadius: "1rem",
                      border: "1px solid var(--color-border)",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      fontSize: "0.875rem",
                    },
                  }}
                />
              </ExamProvider>
            </MonitoringProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
