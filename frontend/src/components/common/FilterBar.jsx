import Search from "../ui/Search"
import Select from "../forms/Select"
import Button from "../ui/Button"
import { FiRefreshCw } from "react-icons/fi"

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  filterValues = {},
  onReset,
  extraActions,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-card border border-border/80 shadow-soft">
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Search
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />

        {filters.map((filter) => (
          <div key={filter.key} className="min-w-[140px]">
            <Select
              options={filter.options}
              value={filterValues[filter.key] || ""}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder || filter.label}
              className="py-1.5 text-xs"
            />
          </div>
        ))}

        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={FiRefreshCw}
            className="text-xs text-muted hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
    </div>
  )
}
