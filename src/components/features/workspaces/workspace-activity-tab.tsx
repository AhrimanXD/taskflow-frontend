"use client"

import { useState } from "react"
import { History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { ActivityRow } from "@/components/features/workspaces/activity-row"
import { useWorkspaceActivity } from "@/hooks/queries/use-activity"

const PAGE_SIZE = 20

export function WorkspaceActivityTab({ workspaceId }: { workspaceId: number }) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const { data: activity, isLoading, isFetching } = useWorkspaceActivity(workspaceId, { limit })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!activity || activity.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No activity yet"
        description="Task and membership changes in this workspace will show up here."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {activity.map((item) => (
          <ActivityRow key={item.id} activity={item} />
        ))}
      </div>
      {activity.length >= limit ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLimit((current) => current + PAGE_SIZE)}
          disabled={isFetching}
        >
          Load more
        </Button>
      ) : null}
    </div>
  )
}
