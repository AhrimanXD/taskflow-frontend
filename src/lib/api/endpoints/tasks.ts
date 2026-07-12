import { api } from "@/lib/api/client"
import { buildQuery } from "@/lib/api/query-string"
import type { ListParams, Task, TaskCreatePayload, TaskUpdatePayload } from "@/types/api"

export const personalTasksApi = {
  list: (params: ListParams = {}) =>
    api.get<Task[]>(`/api/tasks${buildQuery(params)}`),

  create: (payload: TaskCreatePayload) => api.post<Task>("/api/tasks", payload),

  get: (id: string) => api.get<Task>(`/api/tasks/${id}`),

  update: (id: string, payload: TaskUpdatePayload) =>
    api.patch<Task>(`/api/tasks/${id}`, payload),

  remove: (id: string) => api.delete<void>(`/api/tasks/${id}`),
}

export const workspaceTasksApi = {
  list: (workspaceId: string, params: ListParams = {}) =>
    api.get<Task[]>(`/api/workspaces/${workspaceId}/tasks${buildQuery(params)}`),

  create: (workspaceId: string, payload: TaskCreatePayload) =>
    api.post<Task>(`/api/workspaces/${workspaceId}/tasks`, payload),

  get: (workspaceId: string, taskId: string) =>
    api.get<Task>(`/api/workspaces/${workspaceId}/tasks/${taskId}`),

  update: (workspaceId: string, taskId: string, payload: TaskUpdatePayload) =>
    api.patch<Task>(`/api/workspaces/${workspaceId}/tasks/${taskId}`, payload),

  remove: (workspaceId: string, taskId: string) =>
    api.delete<void>(`/api/workspaces/${workspaceId}/tasks/${taskId}`),
}
