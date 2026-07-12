import { api } from "@/lib/api/client"
import { buildQuery } from "@/lib/api/query-string"
import type {
  ListParams,
  Workspace,
  WorkspaceCreatePayload,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceUpdatePayload,
} from "@/types/api"

export const workspacesApi = {
  list: (params: ListParams = {}) =>
    api.get<Workspace[]>(`/api/workspaces${buildQuery(params)}`),

  create: (payload: WorkspaceCreatePayload) =>
    api.post<Workspace>("/api/workspaces", payload),

  get: (id: number) => api.get<Workspace>(`/api/workspaces/${id}`),

  update: (id: number, payload: WorkspaceUpdatePayload) =>
    api.patch<Workspace>(`/api/workspaces/${id}`, payload),

  remove: (id: number) => api.delete<void>(`/api/workspaces/${id}`),

  members: (id: number) =>
    api.get<WorkspaceMember[]>(`/api/workspaces/${id}/members`),

  leave: (id: number) => api.delete<void>(`/api/workspaces/${id}/members/me`),

  updateMemberRole: (id: number, userId: number, role: WorkspaceRole) =>
    api.patch<WorkspaceMember>(`/api/workspaces/${id}/members/${userId}`, { role }),

  removeMember: (id: number, userId: number) =>
    api.delete<void>(`/api/workspaces/${id}/members/${userId}`),
}
