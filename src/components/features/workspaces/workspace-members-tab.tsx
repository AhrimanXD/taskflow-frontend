"use client"

import { UserPlus, Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { InviteMemberDialog } from "@/components/features/invitations/invite-member-dialog"
import { WorkspaceMemberMenu } from "@/components/features/workspaces/workspace-member-menu"
import { initials } from "@/lib/utils/format"
import type { WorkspaceMember } from "@/types/api"

interface WorkspaceMembersTabProps {
  members: WorkspaceMember[]
  isLoading?: boolean
  workspaceId: string
  canManage?: boolean
  isOwner?: boolean
  currentUserId?: string
}

export function WorkspaceMembersTab({
  members,
  isLoading,
  workspaceId,
  canManage,
  isOwner,
  currentUserId,
}: WorkspaceMembersTabProps) {
  const inviteButton = canManage ? (
    <InviteMemberDialog
      workspaceId={workspaceId}
      trigger={
        <Button size="sm">
          <UserPlus className="size-4" />
          Invite member
        </Button>
      }
    />
  ) : null

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members"
        description="This workspace has no members yet."
        action={inviteButton ?? undefined}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
        {inviteButton}
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-lg border">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials(member.user.username)}</AvatarFallback>
              </Avatar>
              <p className="truncate text-sm font-medium text-foreground">
                {member.user.username}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Badge
                variant={member.role === "owner" ? "default" : "outline"}
                className="capitalize"
              >
                {member.role}
              </Badge>
              <WorkspaceMemberMenu
                workspaceId={workspaceId}
                member={member}
                isOwner={!!isOwner}
                canManage={!!canManage}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
