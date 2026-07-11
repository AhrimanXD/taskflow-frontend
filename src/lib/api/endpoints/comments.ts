import { api } from "@/lib/api/client"
import type { Comment, CommentCreatePayload } from "@/types/api"

export const commentsApi = {
  list: (workspaceId: number, taskId: number) =>
    api.get<Comment[]>(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`),

  create: (workspaceId: number, taskId: number, payload: CommentCreatePayload) =>
    api.post<Comment>(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`, payload),

  remove: (workspaceId: number, taskId: number, commentId: number) =>
    api.delete<void>(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`),
}
