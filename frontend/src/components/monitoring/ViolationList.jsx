import ViolationCard from "../cards/ViolationCard"
import EmptyState from "../ui/EmptyState"
import { FiCheckCircle } from "react-icons/fi"

export default function ViolationList({ violations = [] }) {
  if (!violations.length) {
    return (
      <EmptyState
        icon={FiCheckCircle}
        title="No Violations Flagged"
        description="Candidate is complying with standard assessment protocol."
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
      {violations.map((v) => (
        <ViolationCard key={v.id} violation={v} />
      ))}
    </div>
  )
}
