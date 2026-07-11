"use client"

import { History } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WorkspaceActivityTab } from "@/components/features/workspaces/workspace-activity-tab"

/** Experimental right-side drawer for workspace activity, replacing the
 * Activity tab. Opens over the current view so activity can be checked
 * without leaving the board/table. */
export function WorkspaceActivityDrawer({ workspaceId }: { workspaceId: number }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="size-4" />
          Activity
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Activity</SheetTitle>
          <SheetDescription>Recent changes in this workspace.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <WorkspaceActivityTab workspaceId={workspaceId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
