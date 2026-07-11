import { api } from "@/lib/api/client"
import type { StatsOverview } from "@/types/api"

export const statsApi = {
  overview: () => api.get<StatsOverview>("/api/stats/overview"),
}
