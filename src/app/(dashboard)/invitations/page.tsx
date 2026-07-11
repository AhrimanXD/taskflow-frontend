"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Check, Mail, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { DataTable } from "@/components/common/data-table/data-table"
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { InvitationStatusBadge } from "@/components/features/invitations/invitation-status-badge"
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useMyInvitations,
} from "@/hooks/queries/use-invitations"
import { formatDate, initials } from "@/lib/utils/format"
import type { InvitationReceived } from "@/types/api"

export default function InvitationsPage() {
  const { data: invitations, isLoading } = useMyInvitations()
  const acceptInvitation = useAcceptInvitation()
  const declineInvitation = useDeclineInvitation()

  const columns: ColumnDef<InvitationReceived>[] = [
    {
      id: "workspace",
      accessorFn: (row) => row.workspace.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Workspace" />,
      cell: ({ row }) => (
        <Link
          href={`/workspaces/${row.original.workspace.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.workspace.name}
        </Link>
      ),
    },
    {
      id: "inviter",
      accessorFn: (row) => row.inviter.username,
      header: "Invited by",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.original.inviter.username)}</AvatarFallback>
          </Avatar>
          <span>{row.original.inviter.username}</span>
        </div>
      ),
      enableSorting: false,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
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
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => acceptInvitation.mutateAsync(row.original.id)}
            >
              <Check className="size-4" />
              <span className="sr-only">Accept</span>
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon-sm">
                  <X className="size-4" />
                  <span className="sr-only">Decline</span>
                </Button>
              }
              title="Decline invitation"
              description={`Decline the invitation to join "${row.original.workspace.name}"?`}
              confirmLabel="Decline"
              destructive
              onConfirm={async () => {
                await declineInvitation.mutateAsync(row.original.id)
              }}
            />
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations"
        description="Workspace invitations sent to you."
      />

      {!isLoading && invitations?.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No invitations"
          description="You don't have any workspace invitations right now."
        />
      ) : (
        <DataTable columns={columns} data={invitations ?? []} isLoading={isLoading} />
      )}
    </div>
  )
}
