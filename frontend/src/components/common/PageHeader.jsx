import Breadcrumb from "./Breadcrumb"

export default function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="mb-6">
      <Breadcrumb items={breadcrumbs} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
