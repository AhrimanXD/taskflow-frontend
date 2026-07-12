"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { TaskDetailModal } from "@/components/features/tasks/task-detail-modal"
import { TaskPriorityBadge } from "@/components/features/tasks/task-priority-badge"
import { useDeletePersonalTask, useDeleteWorkspaceTask } from "@/hooks/queries/use-tasks"
import { cn } from "@/lib/utils"
import { formatDate, initials, parseApiDate } from "@/lib/utils/format"
import type { Task, WorkspaceMember } from "@/types/api"

interface BoardCardProps {
  task: Task
  workspaceId?: number
  members?: WorkspaceMember[]
  /** True for the floating copy rendered in DragOverlay — no drag listeners, no interactive controls. */
  overlay?: boolean
}

export function BoardCard({ task, workspaceId, members = [], overlay = false }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: overlay,
  })
  const deletePersonalTask = useDeletePersonalTask()
  const deleteWorkspaceTask = useDeleteWorkspaceTask(workspaceId ?? -1)

  const assignee =
    workspaceId !== undefined && task.assignee_id
      ? members.find((m) => m.user_id === task.assignee_id)?.user
      : undefined

  const isOverdue =
    !!task.due_date && parseApiDate(task.due_date) < new Date() && task.status !== "completed"

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onKeyDown={
        overlay
          ? undefined
          : (event) => {
              // React portals bubble events through the React tree, so keys
              // typed in the portaled detail modal/sheet (e.g. the comment
              // box) would otherwise reach dnd-kit's keyboard sensor here and
              // be treated as pick-up/drop. Only start a drag from the card
              // itself, never from a bubbled descendant/portal event.
              if (event.target !== event.currentTarget) return
              listeners?.onKeyDown?.(event)
            }
      }
      className={cn(
        "group rounded-lg border border-border bg-card p-3 shadow-sm",
        !overlay && "cursor-grab touch-none hover:border-foreground/20 active:cursor-grabbing",
        isDragging && "opacity-40",
        overlay && "cursor-grabbing shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {overlay ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            <TaskPriorityBadge priority={task.priority} />
          </div>
        ) : (
          <TaskDetailModal
            task={task}
            workspaceId={workspaceId}
            members={members}
            trigger={
              <div
                className="flex flex-1 cursor-pointer flex-col gap-1"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <p className="text-sm font-medium text-foreground hover:underline">{task.title}</p>
                <TaskPriorityBadge priority={task.priority} />
              </div>
            }
          />
        )}
        {!overlay ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-mt-1 -mr-1 shrink-0 opacity-0 group-hover:opacity-100"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TaskDetailModal
                task={task}
                workspaceId={workspaceId}
                members={members}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <ConfirmDialog
                trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                }
                title="Delete task"
                description={`This will permanently delete "${task.title}". This can't be undone.`}
                confirmLabel="Delete"
                destructive
                onConfirm={() =>
                  workspaceId !== undefined
                    ? deleteWorkspaceTask.mutateAsync(task.id)
                    : deletePersonalTask.mutateAsync(task.id)
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        {task.due_date ? (
          <span
            className={cn(
              "text-xs text-muted-foreground",
              isOverdue && "font-medium text-destructive"
            )}
          >
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}
        {assignee ? (
          <Avatar size="sm">
            <AvatarFallback>{initials(assignee.username)}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  )
}
