import { cn } from "../../utils"

export default function Radio({ label, checked, onChange, name, value, className = "" }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all",
        checked ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-primary/40 hover:bg-light",
        className
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
          checked ? "border-primary" : "border-border"
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full bg-primary transition-transform", checked ? "scale-100" : "scale-0")} />
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}
