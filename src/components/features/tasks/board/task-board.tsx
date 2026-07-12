"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { BoardCard } from "@/components/features/tasks/board/board-card"
import { BoardColumn } from "@/components/features/tasks/board/board-column"
import { ApiError } from "@/lib/api/client"
import { queryKeys } from "@/constants/query-keys"
import { useUpdatePersonalTask, useUpdateWorkspaceTask } from "@/hooks/queries/use-tasks"
import type { Task, TaskStatus, WorkspaceMember } from "@/types/api"

const STATUSES: TaskStatus[] = ["ongoing", "pending", "completed"]

type ColumnsState = Record<TaskStatus, Task[]>

function groupByStatus(tasks: Task[]): ColumnsState {
  const grouped: ColumnsState = { pending: [], ongoing: [], completed: [] }
  for (const task of tasks) grouped[task.status].push(task)
  return grouped
}

function isColumnId(id: string | number): id is TaskStatus {
  return typeof id === "string" && (STATUSES as string[]).includes(id)
}

interface TaskBoardProps {
  tasks: Task[]
  workspaceId?: string
  members?: WorkspaceMember[]
}

export function TaskBoard({ tasks, workspaceId, members = [] }: TaskBoardProps) {
  const [columns, setColumns] = useState<ColumnsState>(() => groupByStatus(tasks))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const queryClient = useQueryClient()
  const updatePersonalTask = useUpdatePersonalTask()
  const updateWorkspaceTask = useUpdateWorkspaceTask(workspaceId ?? "")

  // Re-sync from the server-backed `tasks` prop whenever it changes (fresh
  // fetch, or a teammate's websocket update) — but never mid-drag, or the
  // board would jump under the user's cursor.
  useEffect(() => {
    if (activeId === null) {
      setColumns(groupByStatus(tasks))
    }
  }, [tasks, activeId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function findColumnOfTask(taskId: string): TaskStatus | undefined {
    return STATUSES.find((status) => columns[status].some((t) => t.id === taskId))
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    setActiveId(id)
    const status = findColumnOfTask(id)
    setActiveTask(status ? (columns[status].find((t) => t.id === id) ?? null) : null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeTaskId = String(active.id)
    const activeStatus = findColumnOfTask(activeTaskId)
    const overStatus = isColumnId(over.id) ? over.id : findColumnOfTask(String(over.id))

    if (!activeStatus || !overStatus || activeStatus === overStatus) return

    setColumns((prev) => {
      const sourceItems = prev[activeStatus]
      const targetItems = prev[overStatus]
      const activeIndex = sourceItems.findIndex((t) => t.id === activeTaskId)
      if (activeIndex === -1) return prev

      const movedTask = { ...sourceItems[activeIndex], status: overStatus }
      const newSourceItems = sourceItems.filter((t) => t.id !== activeTaskId)

      let insertIndex = targetItems.length
      if (!isColumnId(over.id)) {
        const overIndex = targetItems.findIndex((t) => t.id === String(over.id))
        if (overIndex !== -1) insertIndex = overIndex
      }
      const newTargetItems = [...targetItems]
      newTargetItems.splice(insertIndex, 0, movedTask)

      return { ...prev, [activeStatus]: newSourceItems, [overStatus]: newTargetItems }
    })
  }

  async function handleDragEnd(event: DragEndEvent) {
    const id = String(event.active.id)
    setActiveId(null)
    setActiveTask(null)

    const newStatus = findColumnOfTask(id)
    const originalTask = tasks.find((t) => t.id === id)
    if (!newStatus || !originalTask || originalTask.status === newStatus) return

    try {
      if (workspaceId !== undefined) {
        await updateWorkspaceTask.mutateAsync({
          taskId: id,
          payload: { status: newStatus, version: originalTask.version },
        })
      } else {
        await updatePersonalTask.mutateAsync({ id, payload: { status: newStatus } })
      }
    } catch (error) {
      // Non-conflict errors already raised a toast in the mutation hook;
      // a 409 (stale version) doesn't, so surface it here specifically.
      if (error instanceof ApiError && error.status === 409 && workspaceId !== undefined) {
        toast.error("This task changed elsewhere — reverted to the latest version.")
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceTasks.all(workspaceId) })
      }
      setColumns(groupByStatus(tasks))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={columns[status]}
            workspaceId={workspaceId}
            members={members}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-72">
            <BoardCard task={activeTask} workspaceId={workspaceId} members={members} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
