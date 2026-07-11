import { api } from "@/lib/api/client"
import { buildQuery } from "@/lib/api/query-string"
import type { Activity, ListParams } from "@/types/api"

export const activityApi = {
  list: (workspaceId: number, params: ListParams = {}) =>
    api.get<Activity[]>(`/api/workspaces/${workspaceId}/activity${buildQuery(params)}`),
}
