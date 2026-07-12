"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { getToken } from "@/lib/auth/token"
import { queryKeys } from "@/constants/query-keys"
import type { Notification, NotificationWsEvent, WsAuthEvent } from "@/types/api"

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"
const MAX_RECONNECT_DELAY_MS = 15000

/** Subscribes to the per-user /ws/notifications channel and patches the
 * notification list + unread-count caches as events arrive, so the bell badge
 * updates instantly. Reconnects with exponential backoff on an unexpected
 * close; gives up if the server rejects auth. */
export function useNotificationsSocket(enabled: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let reconnectAttempt = 0
    let cancelled = false
    let authFailed = false

    function prependNotification(notification: Notification) {
      queryClient.setQueriesData<Notification[]>(
        { queryKey: queryKeys.notifications.all() },
        (old) => {
          if (!old) return old
          if (old.some((n) => n.id === notification.id)) return old
          return [notification, ...old]
        }
      )
      queryClient.setQueryData<{ count: number }>(
        queryKeys.notifications.unreadCount(),
        (old) => ({ count: (old?.count ?? 0) + 1 })
      )
    }

    function handleMessage(payload: NotificationWsEvent | WsAuthEvent) {
      switch (payload.type) {
        case "error":
          authFailed = true
          break
        case "success":
          break
        case "notification.created":
          prependNotification(payload.notification)
          break
      }
    }

    function connect() {
      const token = getToken()
      if (!token || cancelled) return

      socket = new WebSocket(`${WS_BASE_URL}/ws/notifications`)

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
  }, [enabled, queryClient])
}
