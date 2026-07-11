"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Users } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/common/data-table/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header"
import { initials } from "@/lib/utils/format"
import type { WorkspaceMember } from "@/types/api"

const columns: ColumnDef<WorkspaceMember>[] = [
  {
    id: "username",
    accessorFn: (row) => row.user.username,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar size="sm">
          <AvatarFallback>{initials(row.original.user.username)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">{row.original.user.username}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <Badge variant={row.original.role === "owner" ? "default" : "outline"} className="capitalize">
        {row.original.role}
      </Badge>
    ),
  },
]

interface WorkspaceMembersTabProps {
  members: WorkspaceMember[]
  isLoading?: boolean
}

export function WorkspaceMembersTab({ members, isLoading }: WorkspaceMembersTabProps) {
  if (!isLoading && members.length === 0) {
    return (
      <EmptyState icon={Users} title="No members" description="This workspace has no members yet." />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={members}
      isLoading={isLoading}
      searchKey="username"
      searchPlaceholder="Search members..."
    />
  )
}
