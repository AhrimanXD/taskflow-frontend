import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { workspacesApi } from "@/lib/api/endpoints/workspaces"
import { ApiError } from "@/lib/api/client"
import { queryKeys } from "@/constants/query-keys"
import type { ListParams, WorkspaceCreatePayload, WorkspaceUpdatePayload } from "@/types/api"

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function useWorkspaces(params: ListParams = {}) {
  return useQuery({
    queryKey: queryKeys.workspaces.list(params),
    queryFn: () => workspacesApi.list(params),
  })
}

export function useWorkspace(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id ?? -1),
    queryFn: () => workspacesApi.get(id as number),
    enabled: id !== undefined,
  })
}

export function useWorkspaceMembers(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.workspaces.members(id ?? -1),
    queryFn: () => workspacesApi.members(id as number),
    enabled: id !== undefined,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: WorkspaceCreatePayload) => workspacesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() })
      toast.success("Workspace created")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to create workspace")),
  })
}

export function useUpdateWorkspace(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: WorkspaceUpdatePayload) => workspacesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(id) })
      toast.success("Workspace updated")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to update workspace")),
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => workspacesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() })
      toast.success("Workspace deleted")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to delete workspace")),
  })
}

export function useLeaveWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => workspacesApi.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() })
      toast.success("Left workspace")
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to leave workspace")),
  })
}
