import { Badge } from "@/components/ui/badge"
import type { TaskStatus } from "@/types/api"

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  ongoing: "Ongoing",
  completed: "Completed",
}

const STATUS_VARIANT: Record<TaskStatus, "outline" | "secondary" | "default"> = {
  pending: "outline",
  ongoing: "secondary",
  completed: "default",
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
