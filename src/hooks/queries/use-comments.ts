import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { commentsApi } from "@/lib/api/endpoints/comments"
import { ApiError } from "@/lib/api/client"
import { queryKeys } from "@/constants/query-keys"
import type { CommentCreatePayload } from "@/types/api"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function useTaskComments(workspaceId: number | undefined, taskId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.list(workspaceId ?? -1, taskId ?? -1),
    queryFn: () => commentsApi.list(workspaceId as number, taskId as number),
    enabled: workspaceId !== undefined && taskId !== undefined,
  })
}

export function useCreateComment(workspaceId: number, taskId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CommentCreatePayload) =>
      commentsApi.create(workspaceId, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(workspaceId, taskId) })
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to add comment")),
  })
}

export function useDeleteComment(workspaceId: number, taskId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => commentsApi.remove(workspaceId, taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all(workspaceId, taskId) })
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete comment")),
  })
}
