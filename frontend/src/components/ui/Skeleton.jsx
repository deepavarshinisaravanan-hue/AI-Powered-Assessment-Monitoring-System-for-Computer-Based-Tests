import { cn } from "../../utils"

export default function Skeleton({ className = "" }) {
  return <div className={cn("skeleton rounded-lg", className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-8 w-1/2" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  )
}
