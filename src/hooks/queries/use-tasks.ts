import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { personalTasksApi, workspaceTasksApi } from "@/lib/api/endpoints/tasks"
import { ApiError } from "@/lib/api/client"
import { queryKeys } from "@/constants/query-keys"
import type { ListParams, TaskCreatePayload, TaskUpdatePayload } from "@/types/api"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

// --- Personal tasks ---

export function usePersonalTasks(params: ListParams = {}) {
  return useQuery({
    queryKey: queryKeys.personalTasks.list(params),
    queryFn: () => personalTasksApi.list(params),
  })
}

export function useCreatePersonalTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => personalTasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalTasks.all() })
      toast.success("Task created")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to create task")),
  })
}

export function useUpdatePersonalTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TaskUpdatePayload }) =>
      personalTasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalTasks.all() })
      toast.success("Task updated")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update task")),
  })
}

export function useDeletePersonalTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => personalTasksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personalTasks.all() })
      toast.success("Task deleted")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete task")),
  })
}

// --- Workspace tasks ---
// Note: workspace task mutations also arrive live over the /ws/workspaces/{id}
// socket (see useWorkspaceTasksSocket), which patches the same query keys.
// These mutation hooks still invalidate directly so the initiating client
// doesn't wait on its own broadcast round-trip.

export function useWorkspaceTasks(workspaceId: number | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: queryKeys.workspaceTasks.list(workspaceId ?? -1, params),
    queryFn: () => workspaceTasksApi.list(workspaceId as number, params),
    enabled: workspaceId !== undefined,
  })
}

export function useCreateWorkspaceTask(workspaceId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskCreatePayload) =>
      workspaceTasksApi.create(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceTasks.all(workspaceId) })
      toast.success("Task created")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to create task")),
  })
}

export function useUpdateWorkspaceTask(workspaceId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: TaskUpdatePayload }) =>
      workspaceTasksApi.update(workspaceId, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceTasks.all(workspaceId) })
      toast.success("Task updated")
    },
    onError: (error) => {
      // 409 (stale version) is a conflict the caller resolves inline —
      // don't also fire the generic failure toast on top of that UI.
      if (error instanceof ApiError && error.status === 409) return
      toast.error(errorMessage(error, "Failed to update task"))
    },
  })
}

export function useDeleteWorkspaceTask(workspaceId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: number) => workspaceTasksApi.remove(workspaceId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceTasks.all(workspaceId) })
      toast.success("Task deleted")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete task")),
  })
}
