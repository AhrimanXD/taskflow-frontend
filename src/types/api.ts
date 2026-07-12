// Mirrors backend/app/schemas/* and backend/app/models/* enums exactly.
// Keep in sync when the backend adds fields — this is the single source of
// truth for shapes flowing through the API client and react-query cache.

export type TaskStatus = "pending" | "ongoing" | "completed"

export type TaskPriority = "low" | "medium" | "high"

export type WorkspaceRole = "owner" | "admin" | "member"

export type InviteRole = "admin" | "member"

export type InvitationStatus = "pending" | "accepted" | "declined" | "revoked"

export interface User {
  id: number
  email: string
  username: string
  created_at: string
}

export interface UserPublic {
  id: number
  username: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface Workspace {
  id: number
  name: string
  description: string | null
  owner_id: number
  created_at: string
}

export interface WorkspaceMember {
  user_id: number
  role: WorkspaceRole
  user: UserPublic
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  owner_id: number
  assignee_id: number | null
  workspace_id: number | null
  due_date: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  task_id: number
  author_id: number
  body: string
  created_at: string
  author: UserPublic
}

export interface Activity {
  id: number
  workspace_id: number
  actor_id: number
  action: string
  object_type: string
  object_id: number | null
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
  id: number
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
  assignee_id?: number | null
  due_date?: string | null
}

export interface TaskUpdatePayload {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: number | null
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
  | { type: "task.created"; workspace_id: number; task: Task }
  | { type: "task.updated"; workspace_id: number; task: Task }
  | { type: "task.deleted"; workspace_id: number; task: { id: number } }

export type CommentWsEvent =
  | { type: "comment.created"; workspace_id: number; task_id: number; comment: Comment }
  | { type: "comment.deleted"; workspace_id: number; task_id: number; comment: { id: number } }

export type ActivityWsEvent = {
  type: "activity.created"
  workspace_id: number
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
  id: number
  type: string
  message: string
  workspace_id: number | null
  is_read: boolean
  created_at: string
  actor: UserPublic | null
}

export type NotificationWsEvent = {
  type: "notification.created"
  notification: Notification
}
