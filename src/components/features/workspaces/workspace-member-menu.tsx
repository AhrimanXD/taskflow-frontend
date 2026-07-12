"use client"

import { MoreHorizontal, ShieldCheck, ShieldMinus, UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useRemoveMember, useUpdateMemberRole } from "@/hooks/queries/use-workspaces"
import type { WorkspaceMember } from "@/types/api"

interface WorkspaceMemberMenuProps {
  workspaceId: number
  member: WorkspaceMember
  /** The current user is the workspace owner (can change roles). */
  isOwner: boolean
  /** The current user is owner or admin (can remove members). */
  canManage: boolean
  currentUserId?: number
}

export function WorkspaceMemberMenu({
  workspaceId,
  member,
  isOwner,
  canManage,
  currentUserId,
}: WorkspaceMemberMenuProps) {
  const updateRole = useUpdateMemberRole(workspaceId)
  const removeMember = useRemoveMember(workspaceId)

  const isSelf = member.user_id === currentUserId
  const isTargetOwner = member.role === "owner"

  // Owner-only: promote/demote between admin and member.
  const canChangeRole = isOwner && !isTargetOwner && !isSelf
  // Owner/admin, but the owner is protected and admins can't remove admins.
  const canRemove =
    canManage && !isTargetOwner && !isSelf && !(!isOwner && member.role === "admin")

  if (!canChangeRole && !canRemove) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Member actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canChangeRole ? (
          member.role === "member" ? (
            <DropdownMenuItem
              onSelect={() => updateRole.mutate({ userId: member.user_id, role: "admin" })}
            >
              <ShieldCheck className="size-4" />
              Make admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => updateRole.mutate({ userId: member.user_id, role: "member" })}
            >
              <ShieldMinus className="size-4" />
              Change to member
            </DropdownMenuItem>
          )
        ) : null}
        {canRemove ? (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <UserMinus className="size-4" />
                Remove from workspace
              </DropdownMenuItem>
            }
            title="Remove member"
            description={`Remove ${member.user.username} from this workspace? They'll lose access until invited again.`}
            confirmLabel="Remove"
            destructive
            onConfirm={() => removeMember.mutateAsync(member.user_id)}
          />
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
