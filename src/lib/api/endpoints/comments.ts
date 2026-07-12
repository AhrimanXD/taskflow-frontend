import { api } from "@/lib/api/client"
import type { Comment, CommentCreatePayload } from "@/types/api"

export const commentsApi = {
  list: (workspaceId: string, taskId: string) =>
    api.get<Comment[]>(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`),

  create: (workspaceId: string, taskId: string, payload: CommentCreatePayload) =>
    api.post<Comment>(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`, payload),

  remove: (workspaceId: string, taskId: string, commentId: string) =>
    api.delete<void>(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`),
}
