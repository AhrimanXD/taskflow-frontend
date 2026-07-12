import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authApi } from "@/lib/api/endpoints/auth"
import { ApiError } from "@/lib/api/client"
import { queryKeys } from "@/constants/query-keys"
import type { ChangePasswordPayload, ProfileUpdatePayload } from "@/types/api"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => authApi.updateProfile(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user)
      toast.success("Profile updated")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update profile")),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    onSuccess: () => toast.success("Password changed"),
    onError: (error) => toast.error(errorMessage(error, "Failed to change password")),
  })
}
