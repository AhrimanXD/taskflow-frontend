"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { TaskDetailModal } from "@/components/features/tasks/task-detail-modal"
import { TaskStatusBadge } from "@/components/features/tasks/task-status-badge"
import { TaskPriorityBadge } from "@/components/features/tasks/task-priority-badge"
import {
  useDeletePersonalTask,
  useDeleteWorkspaceTask,
} from "@/hooks/queries/use-tasks"
import { formatDate, initials, parseApiDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { Task, WorkspaceMember, WorkspaceRole } from "@/types/api"

interface UseTaskColumnsOptions {
  /** Present only for workspace task tables; enables the assignee column
   * and workspace-aware delete permission (creator or owner/admin). */
  workspaceId?: string
  members?: WorkspaceMember[]
  currentUserId?: string
  currentUserRole?: WorkspaceRole
}

export function useTaskColumns({
  workspaceId,
  members = [],
  currentUserId,
  currentUserRole,
}: UseTaskColumnsOptions): ColumnDef<Task>[] {
  const deletePersonalTask = useDeletePersonalTask()
  const deleteWorkspaceTask = useDeleteWorkspaceTask(workspaceId ?? "")

  const memberByIdMap = new Map(members.map((m) => [m.user_id, m.user]))

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <TaskDetailModal
          task={row.original}
          workspaceId={workspaceId}
          members={members}
          trigger={
            <div className="max-w-xs cursor-pointer">
              <p className="font-medium text-foreground hover:underline">{row.original.title}</p>
              {row.original.description ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {row.original.description}
                </p>
              ) : null}
            </div>
          }
        />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
      cell: ({ row }) => <TaskPriorityBadge priority={row.original.priority} />,
    },
  ]

  if (workspaceId !== undefined) {
    columns.push({
      id: "assignee",
      header: "Assignee",
      enableSorting: false,
      cell: ({ row }) => {
        const assignee = row.original.assignee_id
          ? memberByIdMap.get(row.original.assignee_id)
          : undefined
        if (!assignee) {
          return <span className="text-muted-foreground">Unassigned</span>
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>{initials(assignee.username)}</AvatarFallback>
            </Avatar>
            <span>{assignee.username}</span>
          </div>
        )
      },
    })
  }

  columns.push({
    accessorKey: "due_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />,
    cell: ({ row }) => {
      const dueDate = row.original.due_date
      if (!dueDate) return <span className="text-muted-foreground">—</span>
      const isOverdue = parseApiDate(dueDate) < new Date() && row.original.status !== "completed"
      return (
        <span className={cn(isOverdue && "font-medium text-destructive")}>
          {formatDate(dueDate)}
        </span>
      )
    },
  })

  columns.push({
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      const task = row.original
      const canDelete =
        workspaceId === undefined ||
        task.owner_id === currentUserId ||
        currentUserRole === "owner" ||
        currentUserRole === "admin"

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="size-4" />
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
            {canDelete ? (
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
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  })

  return columns
}
