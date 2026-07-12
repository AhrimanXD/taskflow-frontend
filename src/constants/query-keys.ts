import type { InvitationStatus, ListParams } from "@/types/api"

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  workspaces: {
    all: () => ["workspaces"] as const,
    list: (params: ListParams) => ["workspaces", "list", params] as const,
    detail: (id: string) => ["workspaces", "detail", id] as const,
    members: (id: string) => ["workspaces", "detail", id, "members"] as const,
  },
  personalTasks: {
    all: () => ["tasks", "personal"] as const,
    list: (params: ListParams) => ["tasks", "personal", "list", params] as const,
    detail: (id: string) => ["tasks", "personal", "detail", id] as const,
  },
  workspaceTasks: {
    all: (workspaceId: string) => ["tasks", "workspace", workspaceId] as const,
    list: (workspaceId: string, params: ListParams) =>
      ["tasks", "workspace", workspaceId, "list", params] as const,
    detail: (workspaceId: string, taskId: string) =>
      ["tasks", "workspace", workspaceId, "detail", taskId] as const,
  },
  invitations: {
    mine: (status?: InvitationStatus) => ["invitations", "mine", status] as const,
    workspace: (workspaceId: string, status?: InvitationStatus) =>
      ["invitations", "workspace", workspaceId, status] as const,
  },
  comments: {
    all: (workspaceId: string, taskId: string) =>
      ["comments", workspaceId, taskId] as const,
    list: (workspaceId: string, taskId: string) =>
      ["comments", workspaceId, taskId, "list"] as const,
  },
  activity: {
    all: (workspaceId: string) => ["activity", workspaceId] as const,
    list: (workspaceId: string, params: ListParams) =>
      ["activity", workspaceId, "list", params] as const,
  },
  stats: {
    overview: () => ["stats", "overview"] as const,
  },
  notifications: {
    all: () => ["notifications"] as const,
    list: (params: ListParams) => ["notifications", "list", params] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },
}
