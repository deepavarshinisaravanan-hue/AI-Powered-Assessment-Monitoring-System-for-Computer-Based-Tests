import { FiClock, FiBookOpen, FiPlay, FiCheckCircle } from "react-icons/fi"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import Button from "../ui/Button"

export default function ExamCard({ exam, onStart, onViewResult, isCompleted }) {
  const { title, subject, durationMinutes, totalMarks, date, status } = exam

  return (
    <Card className="flex flex-col justify-between hover:shadow-card transition-all duration-300 border-border/80">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="secondary" className="px-2.5 py-1 text-xs">
            {subject}
          </Badge>
          <Badge
            variant={isCompleted ? "success" : status === "Live" ? "danger" : "info"}
            dot
          >
            {isCompleted ? "Completed" : status || "Upcoming"}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-muted mb-4">
          <span className="flex items-center gap-1.5">
            <FiClock className="w-4 h-4 text-primary" />
            {durationMinutes} mins
          </span>
          <span className="flex items-center gap-1.5">
            <FiBookOpen className="w-4 h-4 text-primary" />
            {totalMarks} Marks
          </span>
          {date && <span>{date}</span>}
        </div>
      </div>

      <div className="pt-3 border-t border-border/60">
        {isCompleted ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={FiCheckCircle}
            onClick={onViewResult}
          >
            View Result
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            icon={FiPlay}
            onClick={onStart}
          >
            Start Assessment
          </Button>
        )}
      </div>
    </Card>
  )
}
