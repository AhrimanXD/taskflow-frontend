import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  status: z.enum(["pending", "ongoing", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional(),
  assignee_id: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
