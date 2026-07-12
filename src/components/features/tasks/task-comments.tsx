"use client"

import { useRef, useState } from "react"
import { Loader2, Send, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useCreateComment, useDeleteComment, useTaskComments } from "@/hooks/queries/use-comments"
import { useAuth } from "@/lib/auth/auth-provider"
import { formatRelative, initials } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { WorkspaceMember } from "@/types/api"

// Matches an @handle being typed at the caret (start of line or after a space),
// mirroring the backend's @(\w+) resolution.
const ACTIVE_MENTION_RE = /(?:^|\s)@(\w*)$/

interface TaskCommentsProps {
  workspaceId: string
  taskId: string
  members: WorkspaceMember[]
}

export function TaskComments({ workspaceId, taskId, members }: TaskCommentsProps) {
  const { user } = useAuth()
  const [body, setBody] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // null = no active @mention; otherwise the current query after "@".
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { data: comments, isLoading } = useTaskComments(workspaceId, taskId)
  const createComment = useCreateComment(workspaceId, taskId)
  const deleteComment = useDeleteComment(workspaceId, taskId)

  const currentUserRole = members.find((m) => m.user_id === user?.id)?.role
  const canModerate = currentUserRole === "owner" || currentUserRole === "admin"

  const memberNames = new Set(members.map((m) => m.user.username.toLowerCase()))
  const suggestions =
    mentionQuery !== null
      ? members
          .filter((m) => m.user.username.toLowerCase().startsWith(mentionQuery.toLowerCase()))
          .slice(0, 6)
      : []
  const showSuggestions = mentionQuery !== null && suggestions.length > 0

  function syncMention(value: string, caret: number) {
    const match = ACTIVE_MENTION_RE.exec(value.slice(0, caret))
    if (match) {
      setMentionQuery(match[1])
      setActiveIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(event.target.value)
    syncMention(event.target.value, event.target.selectionStart ?? event.target.value.length)
  }

  function insertMention(username: string) {
    const el = textareaRef.current
    const caret = el?.selectionStart ?? body.length
    const match = ACTIVE_MENTION_RE.exec(body.slice(0, caret))
    if (!match) return
    const at = caret - match[1].length - 1
    const before = body.slice(0, at)
    const after = body.slice(caret)
    const next = `${before}@${username} ${after}`
    setBody(next)
    setMentionQuery(null)
    const newCaret = before.length + username.length + 2
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(newCaret, newCaret)
    })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showSuggestions) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % suggestions.length)
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault()
        insertMention(suggestions[activeIndex].user.username)
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setMentionQuery(null)
        return
      }
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      submitComment()
    }
  }

  async function submitComment() {
    const trimmed = body.trim()
    if (!trimmed || createComment.isPending) return
    try {
      await createComment.mutateAsync({ body: trimmed })
      setBody("")
      setMentionQuery(null)
    } catch {
      // Failure toast is raised centrally by the mutation hook.
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    submitComment()
  }

  // Highlight @handles that resolve to a real member of this workspace.
  function renderBody(text: string) {
    return text.split(/(@\w+)/g).map((part, index) => {
      const match = /^@(\w+)$/.exec(part)
      if (match && memberNames.has(match[1].toLowerCase())) {
        return (
          <span key={index} className="font-medium text-primary">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">
        Comments
        {comments?.length ? (
          <span className="ml-1 text-muted-foreground">{comments.length}</span>
        ) : null}
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
                    {renderBody(comment.body)}
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

      <form onSubmit={handleSubmit}>
        <div className="relative flex items-end gap-2 rounded-2xl border border-input bg-background p-1.5 pl-3.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
          {showSuggestions ? (
            <div className="absolute bottom-full left-0 z-10 mb-1.5 w-56 overflow-hidden rounded-lg border bg-popover py-1 shadow-md">
              {suggestions.map((m, index) => (
                <button
                  type="button"
                  key={m.user_id}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    insertMention(m.user.username)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm text-popover-foreground",
                    index === activeIndex && "bg-muted"
                  )}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{initials(m.user.username)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{m.user.username}</span>
                </button>
              ))}
            </div>
          ) : null}

          <Textarea
            ref={textareaRef}
            value={body}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment, @mention a teammate…"
            rows={1}
            className="max-h-40 min-h-0 flex-1 resize-none border-0 bg-transparent px-0 py-1.5 shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
          />
          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-xl"
            disabled={!body.trim() || createComment.isPending}
          >
            {createComment.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="sr-only">Send comment</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
