"use client"

import { usePathname, useRouter } from "next/navigation"
import { LogOut, MoreVertical, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { WorkspaceFormDialog } from "@/components/features/workspaces/workspace-form-dialog"
import { useDeleteWorkspace, useLeaveWorkspace } from "@/hooks/queries/use-workspaces"
import type { Workspace } from "@/types/api"

/** The "⋮" actions menu revealed on hover for each workspace in the sidebar.
 * Owners get Rename/Delete; members get Leave. The dialog triggers are nested
 * inside menu items with preventDefault on select so the dialog stays mounted
 * after the dropdown closes. */
export function WorkspaceNavMenu({
  workspace,
  isOwner,
}: {
  workspace: Workspace
  isOwner: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const deleteWorkspace = useDeleteWorkspace()
  const leaveWorkspace = useLeaveWorkspace()

  const leaveIfViewing = () => {
    if (pathname.startsWith(`/workspaces/${workspace.id}`)) {
      router.push("/tasks")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-6 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={(e) => e.preventDefault()}
        >
          <MoreVertical className="size-4" />
          <span className="sr-only">Workspace actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {isOwner ? (
          <>
            <WorkspaceFormDialog
              mode="edit"
              workspace={workspace}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="size-4" />
                  Rename
                </DropdownMenuItem>
              }
            />
            <ConfirmDialog
              trigger={
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              }
              title="Delete workspace"
              description={`This will permanently delete "${workspace.name}" and all of its tasks. This can't be undone.`}
              confirmLabel="Delete"
              destructive
              onConfirm={async () => {
                await deleteWorkspace.mutateAsync(workspace.id)
                leaveIfViewing()
              }}
            />
          </>
        ) : (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <LogOut className="size-4" />
                Leave workspace
              </DropdownMenuItem>
            }
            title="Leave workspace"
            description={`You'll lose access to "${workspace.name}" until you're invited back.`}
            confirmLabel="Leave"
            destructive
            onConfirm={async () => {
              await leaveWorkspace.mutateAsync(workspace.id)
              leaveIfViewing()
            }}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
