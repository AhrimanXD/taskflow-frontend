import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/types/api"

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  high: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        PRIORITY_CLASSES[priority]
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  )
}
