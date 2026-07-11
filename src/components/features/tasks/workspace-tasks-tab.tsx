"use client"

import { ListChecks, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { ViewToggle } from "@/components/common/view-toggle"
import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog"
import { useTaskColumns } from "@/components/features/tasks/task-columns"
import { TaskBoard } from "@/components/features/tasks/board/task-board"
import { useWorkspaceTasks } from "@/hooks/queries/use-tasks"
import { useWorkspaceTasksSocket } from "@/hooks/use-workspace-tasks-socket"
import { useViewPreference } from "@/hooks/use-view-preference"
import { useAuth } from "@/lib/auth/auth-provider"
import type { WorkspaceMember } from "@/types/api"

interface WorkspaceTasksTabProps {
  workspaceId: number
  members: WorkspaceMember[]
}

export function WorkspaceTasksTab({ workspaceId, members }: WorkspaceTasksTabProps) {
  const { user } = useAuth()
  const { data: tasks, isLoading } = useWorkspaceTasks(workspaceId)
  useWorkspaceTasksSocket(workspaceId)
  const [viewMode, setViewMode] = useViewPreference("taskflow-tasks-view")

  const currentUserRole = members.find((m) => m.user_id === user?.id)?.role
  const columns = useTaskColumns({
    workspaceId,
    members,
    currentUserId: user?.id,
    currentUserRole,
  })

  const createTrigger = (
    <Button size="sm">
      <Plus className="size-4" />
      New task
    </Button>
  )

  if (!isLoading && tasks?.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Create a task and optionally assign it to a member of this workspace."
        action={<TaskFormDialog mode="create" workspaceId={workspaceId} members={members} trigger={createTrigger} />}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>
      {viewMode === "board" ? (
        <TaskBoard tasks={tasks ?? []} workspaceId={workspaceId} members={members} />
      ) : (
        <DataTable
          columns={columns}
          data={tasks ?? []}
          isLoading={isLoading}
          searchKey="title"
          searchPlaceholder="Search tasks..."
          toolbar={
            <TaskFormDialog mode="create" workspaceId={workspaceId} members={members} trigger={createTrigger} />
          }
        />
      )}
    </div>
  )
}
