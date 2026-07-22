import { Link, useLocation } from "react-router-dom"
import { FiChevronRight, FiHome } from "react-icons/fi"

export default function Breadcrumb({ items }) {
  const location = useLocation()

  // Generate automatic items if none provided
  const list =
    items ||
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, arr) => {
        const path = `/${arr.slice(0, index + 1).join("/")}`
        const label = segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        return { label, path }
      })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted mb-4">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors mr-2"
      >
        <FiHome className="w-3.5 h-3.5" />
      </Link>
      {list.map((item, index) => {
        const isLast = index === list.length - 1
        return (
          <div key={item.path || index} className="flex items-center">
            <FiChevronRight className="w-3 h-3 text-muted/60 mx-1.5" />
            {isLast ? (
              <span className="font-semibold text-foreground">{item.label}</span>
            ) : (
              <Link to={item.path} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
