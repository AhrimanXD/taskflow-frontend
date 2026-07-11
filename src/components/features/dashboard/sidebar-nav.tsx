"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkspaceFormDialog } from "@/components/features/workspaces/workspace-form-dialog"
import { WorkspaceNavMenu } from "@/components/features/workspaces/workspace-nav-menu"
import { useWorkspaces } from "@/hooks/queries/use-workspaces"
import { useAuth } from "@/lib/auth/auth-provider"
import { cn } from "@/lib/utils"
import { navItems } from "@/constants/nav"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: workspaces, isLoading } = useWorkspaces()

  const addTrigger = (
    <Button variant="ghost" size="icon-sm">
      <Plus className="size-4" />
      <span className="sr-only">New workspace</span>
    </Button>
  )

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <Link href="/tasks" className="flex items-center gap-2 px-3">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <LayoutGrid className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Taskflow</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">
            WORKSPACES
          </span>
          <WorkspaceFormDialog mode="create" trigger={addTrigger} />
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-1.5 px-3 py-1">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map((workspace) => {
              const href = `/workspaces/${workspace.id}`
              const active = pathname === href || pathname.startsWith(`${href}/`)
              const isOwner = workspace.owner_id === user?.id
              return (
                <div
                  key={workspace.id}
                  className={cn(
                    "group/ws relative flex items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground has-[[data-state=open]]:bg-muted",
                    active && "bg-muted font-medium text-foreground"
                  )}
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 pl-3 pr-8 text-sm"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full bg-muted-foreground/40",
                        active && "bg-primary"
                      )}
                    />
                    <span className="truncate">{workspace.name}</span>
                  </Link>
                  <div className="absolute right-1 opacity-0 transition-opacity group-hover/ws:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100">
                    <WorkspaceNavMenu workspace={workspace} isOwner={isOwner} />
                  </div>
                </div>
              )
            })
          ) : (
            <p className="px-3 py-1 text-xs text-muted-foreground">No workspaces yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
