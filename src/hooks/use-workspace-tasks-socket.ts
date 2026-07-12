"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getToken } from "@/lib/auth/token"
import { queryKeys } from "@/constants/query-keys"
import type { Activity, Comment, Task, WorkspaceWsEvent, WsAuthEvent } from "@/types/api"

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"
const MAX_RECONNECT_DELAY_MS = 15000

/** Subscribes to /ws/workspaces/{id} and patches the tasks/comments/activity
 * query caches in place as events arrive, so every connected client sees
 * changes made by teammates without polling. Reconnects with exponential
 * backoff on an unexpected close; gives up if the server rejects auth. */
export function useWorkspaceTasksSocket(workspaceId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!workspaceId) return

    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let reconnectAttempt = 0
    let cancelled = false
    let authFailed = false

    function upsertTask(task: Task) {
      queryClient.setQueriesData<Task[]>(
        { queryKey: queryKeys.workspaceTasks.all(workspaceId as string) },
        (old) => {
          if (!old) return old
          const exists = old.some((t) => t.id === task.id)
          return exists ? old.map((t) => (t.id === task.id ? task : t)) : [task, ...old]
        }
      )
    }

    function removeTask(taskId: string) {
      queryClient.setQueriesData<Task[]>(
        { queryKey: queryKeys.workspaceTasks.all(workspaceId as string) },
        (old) => old?.filter((t) => t.id !== taskId)
      )
    }

    function upsertComment(taskId: string, comment: Comment) {
      queryClient.setQueriesData<Comment[]>(
        { queryKey: queryKeys.comments.all(workspaceId as string, taskId) },
        (old) => {
          if (!old) return old
          const exists = old.some((c) => c.id === comment.id)
          return exists ? old.map((c) => (c.id === comment.id ? comment : c)) : [...old, comment]
        }
      )
    }

    function removeComment(taskId: string, commentId: string) {
      queryClient.setQueriesData<Comment[]>(
        { queryKey: queryKeys.comments.all(workspaceId as string, taskId) },
        (old) => old?.filter((c) => c.id !== commentId)
      )
    }

    function prependActivity(activity: Activity) {
      queryClient.setQueriesData<Activity[]>(
        { queryKey: queryKeys.activity.all(workspaceId as string) },
        (old) => {
          if (!old) return old
          if (old.some((a) => a.id === activity.id)) return old
          return [activity, ...old]
        }
      )
    }

    function handleMessage(payload: WorkspaceWsEvent | WsAuthEvent) {
      switch (payload.type) {
        case "error":
          authFailed = true
          toast.error(payload.detail || "Realtime connection error")
          break
        case "success":
          break
        case "task.created":
        case "task.updated":
          upsertTask(payload.task)
          break
        case "task.deleted":
          removeTask(payload.task.id)
          break
        case "comment.created":
          upsertComment(payload.task_id, payload.comment)
          break
        case "comment.deleted":
          removeComment(payload.task_id, payload.comment.id)
          break
        case "activity.created":
          prependActivity(payload.activity)
          break
      }
    }

    function connect() {
      const token = getToken()
      if (!token || cancelled) return

      socket = new WebSocket(`${WS_BASE_URL}/ws/workspaces/${workspaceId}`)

      socket.onopen = () => {
        reconnectAttempt = 0
        socket?.send(JSON.stringify({ type: "auth", token }))
      }

      socket.onmessage = (event) => {
        try {
          handleMessage(JSON.parse(event.data))
        } catch {
          // Ignore malformed frames.
        }
      }

      socket.onclose = () => {
        if (cancelled || authFailed) return
        const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS)
        reconnectAttempt += 1
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [workspaceId, queryClient])
}
