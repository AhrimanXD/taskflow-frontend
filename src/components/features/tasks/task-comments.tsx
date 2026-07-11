"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useCreateComment, useDeleteComment, useTaskComments } from "@/hooks/queries/use-comments"
import { useAuth } from "@/lib/auth/auth-provider"
import { formatRelative, initials } from "@/lib/utils/format"
import type { WorkspaceMember } from "@/types/api"

interface TaskCommentsProps {
  workspaceId: number
  taskId: number
  members: WorkspaceMember[]
}

export function TaskComments({ workspaceId, taskId, members }: TaskCommentsProps) {
  const { user } = useAuth()
  const [body, setBody] = useState("")

  const { data: comments, isLoading } = useTaskComments(workspaceId, taskId)
  const createComment = useCreateComment(workspaceId, taskId)
  const deleteComment = useDeleteComment(workspaceId, taskId)

  const currentUserRole = members.find((m) => m.user_id === user?.id)?.role
  const canModerate = currentUserRole === "owner" || currentUserRole === "admin"

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    try {
      await createComment.mutateAsync({ body: trimmed })
      setBody("")
    } catch {
      // Failure toast is raised centrally by the mutation hook.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">
        Comments{comments?.length ? <span className="ml-1 text-muted-foreground">{comments.length}</span> : null}
      </h3>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const canDelete = comment.author_id === user?.id || canModerate
            return (
              <div key={comment.id} className="group flex gap-2.5">
                <Avatar size="sm">
                  <AvatarFallback>{initials(comment.author.username)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(comment.created_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {comment.body}
                  </p>
                </div>
                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteComment.mutate(comment.id)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">Delete comment</span>
                  </Button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a comment..."
          rows={2}
        />
        <Button
          type="submit"
          size="sm"
          className="self-end"
          disabled={!body.trim() || createComment.isPending}
        >
          {createComment.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Comment
        </Button>
      </form>
    </div>
  )
}
