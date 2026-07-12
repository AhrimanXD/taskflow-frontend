import { useQuery } from "@tanstack/react-query"

import { activityApi } from "@/lib/api/endpoints/activity"
import { queryKeys } from "@/constants/query-keys"
import type { ListParams } from "@/types/api"

export function useWorkspaceActivity(workspaceId: string | undefined, params: ListParams = {}) {
  return useQuery({
    queryKey: queryKeys.activity.list(workspaceId ?? "", params),
    queryFn: () => activityApi.list(workspaceId as string, params),
    enabled: workspaceId !== undefined,
  })
}
