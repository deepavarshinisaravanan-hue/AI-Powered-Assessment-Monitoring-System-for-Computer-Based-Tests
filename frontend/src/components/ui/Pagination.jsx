import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { cn } from "../../utils"

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...")
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-light disabled:opacity-40"
        aria-label="Previous page"
      >
        <FiChevronLeft />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
              p === page ? "bg-primary text-white" : "border border-border text-foreground hover:bg-light"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-light disabled:opacity-40"
        aria-label="Next page"
      >
        <FiChevronRight />
      </button>
    </div>
  )
}
