import { api } from "@/lib/api/client"
import { buildQuery } from "@/lib/api/query-string"
import type {
  InvitationCreatePayload,
  InvitationForWorkspace,
  InvitationReceived,
  InvitationStatus,
} from "@/types/api"

export const invitationsApi = {
  createForWorkspace: (workspaceId: string, payload: InvitationCreatePayload) =>
    api.post<InvitationForWorkspace>(
      `/api/workspaces/${workspaceId}/invitations`,
      payload
    ),

  listForWorkspace: (workspaceId: string, status?: InvitationStatus) =>
    api.get<InvitationForWorkspace[]>(
      `/api/workspaces/${workspaceId}/invitations${buildQuery({ status })}`
    ),

  revoke: (inviteId: string) =>
    api.post<InvitationForWorkspace>(`/api/invitations/${inviteId}/revoke`),

  listMine: (status?: InvitationStatus) =>
    api.get<InvitationReceived[]>(`/api/invitations${buildQuery({ status })}`),

  accept: (inviteId: string) =>
    api.post<InvitationReceived>(`/api/invitations/${inviteId}/accept`),

  decline: (inviteId: string) =>
    api.post<InvitationReceived>(`/api/invitations/${inviteId}/decline`),
}
