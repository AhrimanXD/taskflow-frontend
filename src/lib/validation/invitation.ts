import { z } from "zod"

export const invitationSchema = z.object({
  invitee_email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: z.enum(["admin", "member"]),
})

export type InvitationFormValues = z.infer<typeof invitationSchema>
