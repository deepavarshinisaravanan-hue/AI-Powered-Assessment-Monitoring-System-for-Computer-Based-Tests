import { FiSearch } from "react-icons/fi"

export default function Search({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
