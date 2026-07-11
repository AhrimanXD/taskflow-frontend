"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BoardCard } from "@/components/features/tasks/board/board-card"
import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog"
import { STATUS_LABEL } from "@/components/features/tasks/task-status-badge"
import { cn } from "@/lib/utils"
import type { Task, TaskStatus, WorkspaceMember } from "@/types/api"

interface BoardColumnProps {
  status: TaskStatus
  tasks: Task[]
  workspaceId?: number
  members: WorkspaceMember[]
}

export function BoardColumn({ status, tasks, workspaceId, members }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const addTrigger = (
    <Button variant="ghost" size="icon-sm">
      <Plus className="size-4" />
      <span className="sr-only">Add task to {STATUS_LABEL[status]}</span>
    </Button>
  )

  return (
    <div className="flex min-h-[60vh] min-w-[280px] max-w-sm flex-1 flex-col rounded-xl border border-border bg-muted/30 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{STATUS_LABEL[status]}</span>
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <TaskFormDialog
          mode="create"
          workspaceId={workspaceId}
          members={members}
          defaultStatus={status}
          trigger={addTrigger}
        />
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1 transition-colors",
          tasks.length === 0 && "items-center justify-center",
          isOver && "bg-muted"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <BoardCard key={task.id} task={task} workspaceId={workspaceId} members={members} />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">No tasks</p>
        ) : null}
      </div>
    </div>
  )
}
