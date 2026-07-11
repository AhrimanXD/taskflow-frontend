"use client"

import { ListChecks, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { DataTable } from "@/components/common/data-table/data-table"
import { ViewToggle } from "@/components/common/view-toggle"
import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog"
import { useTaskColumns } from "@/components/features/tasks/task-columns"
import { TaskBoard } from "@/components/features/tasks/board/task-board"
import { usePersonalTasks } from "@/hooks/queries/use-tasks"
import { useViewPreference } from "@/hooks/use-view-preference"

export default function TasksPage() {
  const { data: tasks, isLoading } = usePersonalTasks()
  const columns = useTaskColumns({})
  const [viewMode, setViewMode] = useViewPreference("taskflow-tasks-view")

  const createTrigger = (
    <Button>
      <Plus className="size-4" />
      New task
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="Personal tasks only you can see."
        action={
          <div className="flex items-center gap-2">
            <ViewToggle value={viewMode} onChange={setViewMode} />
            <TaskFormDialog mode="create" trigger={createTrigger} />
          </div>
        }
      />

      {!isLoading && tasks?.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Create your first personal task to start tracking your work."
          action={<TaskFormDialog mode="create" trigger={createTrigger} />}
        />
      ) : viewMode === "board" ? (
        <TaskBoard tasks={tasks ?? []} />
      ) : (
        <DataTable
          columns={columns}
          data={tasks ?? []}
          isLoading={isLoading}
          searchKey="title"
          searchPlaceholder="Search tasks..."
        />
      )}
    </div>
  )
}
