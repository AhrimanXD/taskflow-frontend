import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { invitationsApi } from "@/lib/api/endpoints/invitations"
import { ApiError } from "@/lib/api/client"
import { queryKeys } from "@/constants/query-keys"
import type { InvitationCreatePayload, InvitationStatus } from "@/types/api"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function useMyInvitations(status?: InvitationStatus) {
  return useQuery({
    queryKey: queryKeys.invitations.mine(status),
    queryFn: () => invitationsApi.listMine(status),
  })
}

export function useWorkspaceInvitations(workspaceId: string | undefined, status?: InvitationStatus) {
  return useQuery({
    queryKey: queryKeys.invitations.workspace(workspaceId ?? "", status),
    queryFn: () => invitationsApi.listForWorkspace(workspaceId as string, status),
    enabled: workspaceId !== undefined,
  })
}

export function useCreateInvitation(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InvitationCreatePayload) =>
      invitationsApi.createForWorkspace(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", "workspace", workspaceId] })
      toast.success("Invitation sent")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to send invitation")),
  })
}

export function useRevokeInvitation(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => invitationsApi.revoke(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", "workspace", workspaceId] })
      toast.success("Invitation revoked")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to revoke invitation")),
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => invitationsApi.accept(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", "mine"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() })
      toast.success("Invitation accepted")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to accept invitation")),
  })
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => invitationsApi.decline(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", "mine"] })
      toast.success("Invitation declined")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to decline invitation")),
  })
}
