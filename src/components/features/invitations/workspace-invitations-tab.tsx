"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Mail, Plus, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { InvitationStatusBadge } from "@/components/features/invitations/invitation-status-badge"
import { InviteMemberDialog } from "@/components/features/invitations/invite-member-dialog"
import { useRevokeInvitation, useWorkspaceInvitations } from "@/hooks/queries/use-invitations"
import { formatDate, initials } from "@/lib/utils/format"
import type { InvitationForWorkspace } from "@/types/api"

interface WorkspaceInvitationsTabProps {
  workspaceId: number
}

export function WorkspaceInvitationsTab({ workspaceId }: WorkspaceInvitationsTabProps) {
  const { data: invitations, isLoading } = useWorkspaceInvitations(workspaceId)
  const revokeInvitation = useRevokeInvitation(workspaceId)

  const columns: ColumnDef<InvitationForWorkspace>[] = [
    {
      id: "invitee",
      accessorFn: (row) => row.invitee.username,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invitee" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.original.invitee.username)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{row.original.invitee.username}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <span className="capitalize">{row.original.role}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <InvitationStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sent" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        if (row.original.status !== "pending") return null
        return (
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
                <span className="sr-only">Revoke invitation</span>
              </Button>
            }
            title="Revoke invitation"
            description={`Revoke the pending invitation to ${row.original.invitee.username}?`}
            confirmLabel="Revoke"
            destructive
            onConfirm={async () => {
              await revokeInvitation.mutateAsync(row.original.id)
            }}
          />
        )
      },
    },
  ]

  const inviteTrigger = (
    <Button size="sm">
      <Plus className="size-4" />
      Invite member
    </Button>
  )

  if (!isLoading && invitations?.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No invitations sent"
        description="Invite people by email to join this workspace."
        action={<InviteMemberDialog workspaceId={workspaceId} trigger={inviteTrigger} />}
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={invitations ?? []}
      isLoading={isLoading}
      toolbar={<InviteMemberDialog workspaceId={workspaceId} trigger={inviteTrigger} />}
    />
  )
}
