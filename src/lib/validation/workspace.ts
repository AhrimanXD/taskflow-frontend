import { z } from "zod"

export const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
})

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>
