import StudentCard from "../cards/StudentCard"
import EmptyState from "../ui/EmptyState"
import { FiUsers } from "react-icons/fi"

export default function LiveStudentGrid({ students = [], onViewDetails }) {
  if (!students.length) {
    return (
      <EmptyState
        icon={FiUsers}
        title="No Live Candidates Found"
        description="There are currently no active student sessions matching your filters."
        className="py-12"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} onViewDetails={onViewDetails} />
      ))}
    </div>
  )
}
