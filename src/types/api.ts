// Mirrors backend/app/schemas/* and backend/app/models/* enums exactly.
// Keep in sync when the backend adds fields — this is the single source of
// truth for shapes flowing through the API client and react-query cache.
//
// IDs and foreign keys are UUIDv7 strings (backend switched off integer
// auto-increment). The only numeric identifier-ish field is Task.version, the
// optimistic-concurrency guard.

export type TaskStatus = "pending" | "ongoing" | "completed"

export type TaskPriority = "low" | "medium" | "high"

export type WorkspaceRole = "owner" | "admin" | "member"

export type InviteRole = "admin" | "member"

export type InvitationStatus = "pending" | "accepted" | "declined" | "revoked"

export interface User {
  id: string
  email: string
  username: string
  created_at: string
}

export interface UserPublic {
  id: string
  username: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface TokenRefreshPayload {
  refresh_token: string
}

export interface Workspace {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

export interface WorkspaceMember {
  user_id: string
  role: WorkspaceRole
  user: UserPublic
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  owner_id: string
  assignee_id: string | null
  workspace_id: string | null
  due_date: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  task_id: string
  author_id: string
  body: string
  created_at: string
  author: UserPublic
}

export interface Activity {
  id: string
  workspace_id: string
  actor_id: string
  action: string
  object_type: string
  object_id: string | null
  summary: string
  created_at: string
  actor: UserPublic
}

export interface StatsOverview {
  total: number
  by_status: Record<TaskStatus, number>
  by_priority: Record<TaskPriority, number>
  overdue: number
  assigned_to_me: number
  workspace_count: number
  recent_activity: Activity[]
}

export interface Invitation {
  id: string
  role: InviteRole
  status: InvitationStatus
  created_at: string
}

export interface InvitationReceived extends Invitation {
  inviter: UserPublic
  workspace: Workspace
}

export interface InvitationForWorkspace extends Invitation {
  inviter: UserPublic
  invitee: UserPublic
}

// --- Request payloads ---

export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface WorkspaceCreatePayload {
  name: string
  description?: string | null
}

export interface WorkspaceUpdatePayload {
  name?: string
  description?: string | null
}

export interface TaskCreatePayload {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null
  due_date?: string | null
}

export interface TaskUpdatePayload {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null
  due_date?: string | null
  /** Required by the workspace task update route for optimistic concurrency
   * control; ignored by the personal task tree. */
  version?: number
}

/** Shape of a 409 response body from a workspace task update. */
export interface TaskConflict {
  message: string
  current: Task
}

export interface CommentCreatePayload {
  body: string
}

export interface InvitationCreatePayload {
  invitee_email: string
  role?: InviteRole
}

export interface ListParams {
  skip?: number
  limit?: number
}

// --- Realtime (WS /ws/workspaces/{workspace_id}) ---

export type TaskWsEvent =
  | { type: "task.created"; workspace_id: string; task: Task }
  | { type: "task.updated"; workspace_id: string; task: Task }
  | { type: "task.deleted"; workspace_id: string; task: { id: string } }

export type CommentWsEvent =
  | { type: "comment.created"; workspace_id: string; task_id: string; comment: Comment }
  | { type: "comment.deleted"; workspace_id: string; task_id: string; comment: { id: string } }

export type ActivityWsEvent = {
  type: "activity.created"
  workspace_id: string
  activity: Activity
}

export type WorkspaceWsEvent = TaskWsEvent | CommentWsEvent | ActivityWsEvent

export type WsAuthEvent =
  | { type: "success"; detail: string }
  | { type: "error"; detail: string }

export interface ProfileUpdatePayload {
  username?: string
  email?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface Notification {
  id: string
  type: string
  message: string
  workspace_id: string | null
  is_read: boolean
  created_at: string
  actor: UserPublic | null
}

export type NotificationWsEvent = {
  type: "notification.created"
  notification: Notification
}
