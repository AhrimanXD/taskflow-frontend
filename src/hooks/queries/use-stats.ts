import { useQuery } from "@tanstack/react-query"

import { statsApi } from "@/lib/api/endpoints/stats"
import { queryKeys } from "@/constants/query-keys"

export function useStatsOverview() {
  return useQuery({
    queryKey: queryKeys.stats.overview(),
    queryFn: () => statsApi.overview(),
  })
}
