"use client"

import { AlertTriangle, Building2, CheckCircle2, ListTodo } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { ActivityRow } from "@/components/features/workspaces/activity-row"
import { STATUS_LABEL } from "@/components/features/tasks/task-status-badge"
import { PRIORITY_LABEL } from "@/components/features/tasks/task-priority-badge"
import { useStatsOverview } from "@/hooks/queries/use-stats"
import type { StatsOverview, TaskPriority, TaskStatus } from "@/types/api"

const STAT_CARDS: { key: keyof Pick<StatsOverview, "total" | "overdue" | "assigned_to_me" | "workspace_count">; label: string; icon: LucideIcon }[] = [
  { key: "total", label: "Total tasks", icon: ListTodo },
  { key: "overdue", label: "Overdue", icon: AlertTriangle },
  { key: "assigned_to_me", label: "Assigned to me", icon: CheckCircle2 },
  { key: "workspace_count", label: "Workspaces", icon: Building2 },
]

const STATUS_ORDER: TaskStatus[] = ["ongoing", "pending", "completed"]
const PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"]

function BreakdownBar({ label, count, total }: { label: string; count: number; total: number }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useStatsOverview()

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="An overview of your work across every workspace."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="An overview of your work across every workspace."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{stats[card.key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {STATUS_ORDER.map((status) => (
              <BreakdownBar
                key={status}
                label={STATUS_LABEL[status]}
                count={stats.by_status[status] ?? 0}
                total={stats.total}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PRIORITY_ORDER.map((priority) => (
              <BreakdownBar
                key={priority}
                label={PRIORITY_LABEL[priority]}
                count={stats.by_priority[priority] ?? 0}
                total={stats.total}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.recent_activity.length > 0 ? (
            stats.recent_activity.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
