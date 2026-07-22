import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"
import { FiHome, FiAlertCircle } from "react-icons/fi"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mx-auto animate-scale-in">
          <FiAlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">404 — Page Not Found</h1>
        <p className="text-sm text-muted">
          The requested page route could not be found or you do not have permission to access it.
        </p>
        <Link to="/" className="inline-block">
          <Button variant="primary" icon={FiHome}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
