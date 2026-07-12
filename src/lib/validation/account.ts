import { z } from "zod"

export const profileSchema = z.object({
  username: z.string().min(1, "Username is required").max(100, "Username is too long"),
  email: z.string().email("Enter a valid email"),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

export type PasswordFormValues = z.infer<typeof passwordSchema>
