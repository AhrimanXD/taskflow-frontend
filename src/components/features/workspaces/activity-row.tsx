"use client"

import { MessageSquare, Pencil, Plus, Trash2, UserCog, UserMinus, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-provider"
import { formatRelative } from "@/lib/utils/format"
import type { Activity } from "@/types/api"

const ACTION_ICON: Record<string, LucideIcon> = {
  "task.created": Plus,
  "task.updated": Pencil,
  "task.deleted": Trash2,
  "comment.created": MessageSquare,
  "member.left": UserMinus,
  "member.removed": UserMinus,
  "member.role_changed": UserCog,
}

export function ActivityRow({ activity }: { activity: Activity }) {
  const { user } = useAuth()
  const Icon = ACTION_ICON[activity.action] ?? Users
  const actorLabel = activity.actor.id === user?.id ? "You" : activity.actor.username

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{activity.summary}</p>
        <p className="text-xs text-muted-foreground">
          {actorLabel} · {formatRelative(activity.created_at)}
        </p>
      </div>
    </div>
  )
}
