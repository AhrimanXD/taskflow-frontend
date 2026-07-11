"use client"

import { List, SquareKanban } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/hooks/use-view-preference"

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(value === "list" && "bg-muted")}
        onClick={() => onChange("list")}
      >
        <List className="size-4" />
        <span className="sr-only">List view</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(value === "board" && "bg-muted")}
        onClick={() => onChange("board")}
      >
        <SquareKanban className="size-4" />
        <span className="sr-only">Board view</span>
      </Button>
    </div>
  )
}
