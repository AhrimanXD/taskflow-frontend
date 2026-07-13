import { api } from "@/lib/api/client"
import type {
  ChangePasswordPayload,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  Token,
  TokenRefreshPayload,
  User,
} from "@/types/api"

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<User>("/api/auth/register", payload, { auth: false }),

  // Backend uses OAuth2PasswordRequestForm: the "username" field carries the
  // user's email.
  login: (payload: LoginPayload) =>
    api.form<Token>(
      "/api/auth/login",
      { username: payload.email, password: payload.password },
      { auth: false }
    ),

  refresh: (payload: TokenRefreshPayload) =>
    api.post<Token>("/api/auth/refresh", payload, { auth: false }),

  me: () => api.get<User>("/api/auth/me"),

  updateProfile: (payload: ProfileUpdatePayload) =>
    api.patch<User>("/api/auth/me", payload),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<void>("/api/auth/change-password", payload),
}
