"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { TaskComments } from "@/components/features/tasks/task-comments"
import { STATUS_LABEL } from "@/components/features/tasks/task-status-badge"
import { ApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { formatDueDistance } from "@/lib/utils/format"
import { useUpdatePersonalTask, useUpdateWorkspaceTask } from "@/hooks/queries/use-tasks"
import { useWorkspaces } from "@/hooks/queries/use-workspaces"
import type {
  Task,
  TaskConflict,
  TaskPriority,
  TaskStatus,
  TaskUpdatePayload,
  WorkspaceMember,
} from "@/types/api"

const UNASSIGNED = "unassigned"

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

function toDateInputValue(value: string | null): string {
  if (!value) return ""
  return value.slice(0, 10)
}

interface TaskDetailSheetProps {
  task: Task
  trigger: React.ReactNode
  workspaceId?: number
  members?: WorkspaceMember[]
}

export function TaskDetailSheet({ task, trigger, workspaceId, members = [] }: TaskDetailSheetProps) {
  const [open, setOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task>(task)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? "")
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [assigneeId, setAssigneeId] = useState(
    task.assignee_id ? String(task.assignee_id) : UNASSIGNED
  )
  const [dueDate, setDueDate] = useState(toDateInputValue(task.due_date))
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)

  const updatePersonalTask = useUpdatePersonalTask()
  const updateWorkspaceTask = useUpdateWorkspaceTask(workspaceId ?? -1)

  const { data: workspaces } = useWorkspaces()
  const workspaceName =
    workspaceId !== undefined
      ? workspaces?.find((w) => w.id === workspaceId)?.name
      : undefined

  useEffect(() => {
    if (open) {
      setCurrentTask(task)
      setTitle(task.title)
      setDescription(task.description ?? "")
      setStatus(task.status)
      setPriority(task.priority)
      setAssigneeId(task.assignee_id ? String(task.assignee_id) : UNASSIGNED)
      setDueDate(toDateInputValue(task.due_date))
      setConflictMessage(null)
    }
  }, [open, task])

  const isDirty =
    title !== currentTask.title ||
    description !== (currentTask.description ?? "") ||
    status !== currentTask.status ||
    priority !== currentTask.priority ||
    dueDate !== toDateInputValue(currentTask.due_date) ||
    (workspaceId !== undefined &&
      assigneeId !== (currentTask.assignee_id ? String(currentTask.assignee_id) : UNASSIGNED))

  const isSaving =
    workspaceId !== undefined ? updateWorkspaceTask.isPending : updatePersonalTask.isPending

  const dueHint = dueDate ? formatDueDistance(dueDate) : null

  function applyServerTask(fresh: Task) {
    setCurrentTask(fresh)
    setTitle(fresh.title)
    setDescription(fresh.description ?? "")
    setStatus(fresh.status)
    setPriority(fresh.priority)
    setAssigneeId(fresh.assignee_id ? String(fresh.assignee_id) : UNASSIGNED)
    setDueDate(toDateInputValue(fresh.due_date))
  }

  async function handleSave() {
    setConflictMessage(null)
    const payload: TaskUpdatePayload = {
      title,
      description: description || null,
      status,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      ...(workspaceId !== undefined
        ? { assignee_id: assigneeId !== UNASSIGNED ? Number(assigneeId) : null }
        : {}),
    }

    try {
      if (workspaceId !== undefined) {
        const updated = await updateWorkspaceTask.mutateAsync({
          taskId: currentTask.id,
          payload: { ...payload, version: currentTask.version },
        })
        applyServerTask(updated)
      } else {
        const updated = await updatePersonalTask.mutateAsync({ id: currentTask.id, payload })
        applyServerTask(updated)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const conflict = error.detail as TaskConflict
        applyServerTask(conflict.current)
        setConflictMessage(
          conflict.message ||
            "This task was changed by someone else. The latest version has been loaded — please redo your edit."
        )
      }
      // Other errors already raised a toast in the mutation hook.
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{workspaceName ?? "My Tasks"}</span>
            <ChevronRight className="size-3 shrink-0" />
            <span className="shrink-0">{STATUS_LABEL[currentTask.status]}</span>
          </div>
          <SheetTitle className="sr-only">Task details</SheetTitle>
          <SheetDescription className="sr-only">View and edit this task.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {conflictMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Task changed elsewhere</AlertTitle>
              <AlertDescription>{conflictMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
            {dueHint ? (
              <p className={cn("text-xs", dueHint.overdue ? "text-destructive" : "text-muted-foreground")}>
                {dueHint.label}
              </p>
            ) : null}
          </div>

          {workspaceId !== undefined ? (
            <div className="flex flex-col gap-1.5">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={String(member.user_id)}>
                      {member.user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {isDirty ? (
            <Button onClick={handleSave} disabled={isSaving} className="self-start">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          ) : null}

          {workspaceId !== undefined ? (
            <>
              <Separator />
              <TaskComments workspaceId={workspaceId} taskId={currentTask.id} members={members} />
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
