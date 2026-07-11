"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Building2, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { WorkspaceFormDialog } from "@/components/features/workspaces/workspace-form-dialog"
import { WorkspaceMembersTab } from "@/components/features/workspaces/workspace-members-tab"
import { WorkspaceTasksTab } from "@/components/features/tasks/workspace-tasks-tab"
import { WorkspaceInvitationsTab } from "@/components/features/invitations/workspace-invitations-tab"
import { WorkspaceActivityTab } from "@/components/features/workspaces/workspace-activity-tab"
import {
  useDeleteWorkspace,
  useWorkspace,
  useWorkspaceMembers,
} from "@/hooks/queries/use-workspaces"
import { useAuth } from "@/lib/auth/auth-provider"

export default function WorkspaceDetailPage() {
  const params = useParams<{ id: string }>()
  const workspaceId = Number(params.id)
  const router = useRouter()
  const { user } = useAuth()

  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId)
  const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId)
  const deleteWorkspace = useDeleteWorkspace()

  const currentMember = useMemo(
    () => members?.find((m) => m.user_id === user?.id),
    [members, user?.id]
  )
  const isOwner = workspace?.owner_id === user?.id
  const canManage = isOwner || currentMember?.role === "admin"

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !workspace) {
    return (
      <EmptyState
        icon={Building2}
        title="Workspace not found"
        description="It may have been deleted, or you don't have access to it."
        action={
          <Button asChild variant="outline">
            <Link href="/tasks">Back to my tasks</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={workspace.name}
        description={workspace.description || undefined}
        action={
          isOwner ? (
            <div className="flex items-center gap-2">
              <WorkspaceFormDialog
                mode="edit"
                workspace={workspace}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                }
              />
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm">
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                }
                title="Delete workspace"
                description={`This will permanently delete "${workspace.name}" and all of its tasks. This can't be undone.`}
                confirmLabel="Delete"
                destructive
                onConfirm={async () => {
                  await deleteWorkspace.mutateAsync(workspace.id)
                  router.push("/tasks")
                }}
              />
            </div>
          ) : undefined
        }
      />

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {canManage ? <TabsTrigger value="invitations">Invitations</TabsTrigger> : null}
        </TabsList>
        <TabsContent value="tasks" className="mt-4">
          <WorkspaceTasksTab workspaceId={workspaceId} members={members ?? []} />
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <WorkspaceMembersTab members={members ?? []} isLoading={isMembersLoading} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <WorkspaceActivityTab workspaceId={workspaceId} />
        </TabsContent>
        {canManage ? (
          <TabsContent value="invitations" className="mt-4">
            <WorkspaceInvitationsTab workspaceId={workspaceId} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
