import { api } from "@/lib/api/client"
import { buildQuery } from "@/lib/api/query-string"
import type { ListParams, Notification } from "@/types/api"

export const notificationsApi = {
  list: (params: ListParams = {}) =>
    api.get<Notification[]>(`/api/notifications${buildQuery(params)}`),

  unreadCount: () => api.get<{ count: number }>("/api/notifications/unread-count"),

  markRead: (id: string) => api.post<void>(`/api/notifications/${id}/read`),

  markAllRead: () => api.post<void>("/api/notifications/read-all"),
}
