import Spinner from "./Spinner"

export default function Loader({ label = "Loading...", fullscreen = false }) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <Spinner size={32} className="text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
  if (fullscreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">{inner}</div>
    )
  }
  return inner
}
