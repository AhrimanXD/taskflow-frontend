"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateWorkspace, useUpdateWorkspace } from "@/hooks/queries/use-workspaces"
import { workspaceSchema, type WorkspaceFormValues } from "@/lib/validation/workspace"
import type { Workspace } from "@/types/api"

interface WorkspaceFormDialogProps {
  mode: "create" | "edit"
  workspace?: Workspace
  trigger: React.ReactNode
}

export function WorkspaceFormDialog({ mode, workspace, trigger }: WorkspaceFormDialogProps) {
  const [open, setOpen] = useState(false)
  const createWorkspace = useCreateWorkspace()
  const updateWorkspace = useUpdateWorkspace(workspace?.id ?? -1)

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: workspace?.name ?? "",
        description: workspace?.description ?? "",
      })
    }
  }, [open, workspace, form])

  async function onSubmit(values: WorkspaceFormValues) {
    const payload = { name: values.name, description: values.description || null }
    try {
      if (mode === "create") {
        await createWorkspace.mutateAsync(payload)
      } else {
        await updateWorkspace.mutateAsync(payload)
      }
      setOpen(false)
    } catch {
      // Failure toast is raised centrally by the mutation hook.
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New workspace" : "Edit workspace"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a shared space for your team to collaborate on tasks."
              : "Update your workspace details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this workspace for?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "create" ? "Create workspace" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
