import EmptyState from "../ui/EmptyState"

export default function Table({ columns, data, onRowClick, emptyMessage = "No records found" }) {
  if (!data?.length) {
    return <EmptyState title="No data" message={emptyMessage} />
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop table */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border/60 transition-colors last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-light" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3.5 text-foreground">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((row, i) => (
          <div
            key={row.id || i}
            onClick={() => onRowClick?.(row)}
            className={`rounded-xl border border-border bg-card p-4 ${onRowClick ? "cursor-pointer active:scale-[0.99]" : ""}`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-3 py-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">{col.header}</span>
                <span className="text-right text-foreground">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
