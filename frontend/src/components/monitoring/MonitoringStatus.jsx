import { FiUser, FiSmartphone, FiUsers, FiGlobe, FiMaximize2 } from "react-icons/fi"
import Card from "../ui/Card"

export default function MonitoringStatus({ status }) {
  const { face, phone, multiplePersons, browser, fullscreen } = status

  const items = [
    {
      id: "face",
      label: "Face Detection",
      active: face,
      warningText: "No Face Detected",
      successText: "Face Verified",
      icon: FiUser,
      isDanger: !face,
    },
    {
      id: "phone",
      label: "Phone Detection",
      active: !phone,
      warningText: "Phone Detected!",
      successText: "No Phone Detected",
      icon: FiSmartphone,
      isDanger: phone,
    },
    {
      id: "multiplePersons",
      label: "Multiple Persons",
      active: !multiplePersons,
      warningText: "Multiple Faces Flagged!",
      successText: "Single Candidate",
      icon: FiUsers,
      isDanger: multiplePersons,
    },
    {
      id: "browser",
      label: "Browser Status",
      active: browser,
      warningText: "Tab Inactive / Blur",
      successText: "Active Tab",
      icon: FiGlobe,
      isDanger: !browser,
    },
    {
      id: "fullscreen",
      label: "Fullscreen Status",
      active: fullscreen,
      warningText: "Fullscreen Exited",
      successText: "Fullscreen Active",
      icon: FiMaximize2,
      isDanger: !fullscreen,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const Icon = item.icon
        const hasWarning = item.isDanger

        return (
          <Card
            key={item.id}
            className={`p-3.5 border transition-all duration-300 ${
              hasWarning
                ? "border-danger bg-danger/10 text-danger shadow-md shadow-danger/10 animate-scale-in"
                : "border-border/80 bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2 rounded-xl ${
                  hasWarning ? "bg-danger/20 text-danger" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hasWarning ? "bg-danger animate-ping" : "bg-success"
                }`}
              />
            </div>

            <p className="text-[11px] font-medium text-muted mb-0.5">{item.label}</p>
            <h5
              className={`text-xs font-bold truncate ${
                hasWarning ? "text-danger" : "text-foreground"
              }`}
            >
              {hasWarning ? item.warningText : item.successText}
            </h5>
          </Card>
        )
      })}
    </div>
  )
}
