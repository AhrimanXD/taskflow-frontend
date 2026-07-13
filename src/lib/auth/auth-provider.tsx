"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authApi } from "@/lib/api/endpoints/auth"
import { ApiError, setUnauthorizedHandler } from "@/lib/api/client"
import { clearTokens, getToken, setTokens } from "@/lib/auth/token"
import { queryKeys } from "@/constants/query-keys"
import type { LoginPayload, RegisterPayload, User } from "@/types/api"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  // null = not yet hydrated from localStorage (avoids SSR/client mismatch)
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    setHasToken(!!getToken())
  }, [])

  const meQuery = useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    enabled: hasToken === true,
    retry: false,
  })

  const logout = useCallback(() => {
    clearTokens()
    setHasToken(false)
    queryClient.removeQueries({ queryKey: queryKeys.auth.me() })
    queryClient.clear()
    router.replace("/login")
  }, [queryClient, router])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (token) => {
      setTokens(token.access_token, token.refresh_token)
      setHasToken(true)
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
    onError: (error) => toast.error(errorMessage(error, "Login failed")),
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onError: (error) => toast.error(errorMessage(error, "Registration failed")),
  })

  const login = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload)
    },
    [loginMutation]
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerMutation.mutateAsync(payload)
    },
    [registerMutation]
  )

  const isLoading = hasToken === null || (hasToken === true && meQuery.isPending)

  const value: AuthContextValue = {
    user: meQuery.data ?? null,
    isLoading,
    isAuthenticated: !isLoading && !!meQuery.data,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
