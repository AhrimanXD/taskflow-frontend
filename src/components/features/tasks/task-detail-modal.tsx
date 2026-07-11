"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface TaskDetailModalProps {
  task: Task
  trigger: React.ReactNode
  workspaceId?: number
  members?: WorkspaceMember[]
}

/** Experimental centered-modal variant of the task detail view (image 4):
 * a two-column layout with the editable body on the left and a meta rail on
 * the right. Shares the same optimistic-concurrency save logic as the
 * TaskDetailSheet. */
export function TaskDetailModal({ task, trigger, workspaceId, members = [] }: TaskDetailModalProps) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">Task details</DialogTitle>
        <DialogDescription className="sr-only">View and edit this task.</DialogDescription>

        <div className="grid max-h-[85vh] md:grid-cols-[1fr_16rem]">
          {/* Main body */}
          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            <div className="flex items-center gap-1 pr-8 text-xs text-muted-foreground">
              <span className="truncate">{workspaceName ?? "My Tasks"}</span>
              <ChevronRight className="size-3 shrink-0" />
              <span className="shrink-0">{STATUS_LABEL[currentTask.status]}</span>
            </div>

            {conflictMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Task changed elsewhere</AlertTitle>
                <AlertDescription>{conflictMessage}</AlertDescription>
              </Alert>
            ) : null}

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-auto border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              placeholder="Task title"
            />

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Add more detail…"
              />
            </div>

            {workspaceId !== undefined ? (
              <div className="mt-2 border-t pt-4">
                <TaskComments
                  workspaceId={workspaceId}
                  taskId={currentTask.id}
                  members={members}
                />
              </div>
            ) : null}
          </div>

          {/* Meta rail */}
          <div className="flex flex-col gap-4 overflow-y-auto border-t bg-muted/30 p-6 md:border-l md:border-t-0">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs tracking-wide text-muted-foreground uppercase">Status</Label>
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
              <Label className="text-xs tracking-wide text-muted-foreground uppercase">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
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

            {workspaceId !== undefined ? (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs tracking-wide text-muted-foreground uppercase">Assignee</Label>
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

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs tracking-wide text-muted-foreground uppercase">Due date</Label>
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

            {isDirty ? (
              <Button onClick={handleSave} disabled={isSaving} className="mt-2 w-full">
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
