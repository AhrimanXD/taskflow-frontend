import { api } from "@/lib/api/client"
import { buildQuery } from "@/lib/api/query-string"
import type { ListParams, Task, TaskCreatePayload, TaskUpdatePayload } from "@/types/api"

export const personalTasksApi = {
  list: (params: ListParams = {}) =>
    api.get<Task[]>(`/api/tasks${buildQuery(params)}`),

  create: (payload: TaskCreatePayload) => api.post<Task>("/api/tasks", payload),

  get: (id: number) => api.get<Task>(`/api/tasks/${id}`),

  update: (id: number, payload: TaskUpdatePayload) =>
    api.patch<Task>(`/api/tasks/${id}`, payload),

  remove: (id: number) => api.delete<void>(`/api/tasks/${id}`),
}

export const workspaceTasksApi = {
  list: (workspaceId: number, params: ListParams = {}) =>
    api.get<Task[]>(`/api/workspaces/${workspaceId}/tasks${buildQuery(params)}`),

  create: (workspaceId: number, payload: TaskCreatePayload) =>
    api.post<Task>(`/api/workspaces/${workspaceId}/tasks`, payload),

  get: (workspaceId: number, taskId: number) =>
    api.get<Task>(`/api/workspaces/${workspaceId}/tasks/${taskId}`),

  update: (workspaceId: number, taskId: number, payload: TaskUpdatePayload) =>
    api.patch<Task>(`/api/workspaces/${workspaceId}/tasks/${taskId}`, payload),

  remove: (workspaceId: number, taskId: number) =>
    api.delete<void>(`/api/workspaces/${workspaceId}/tasks/${taskId}`),
}
