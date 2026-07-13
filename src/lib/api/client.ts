import {
  clearTokens,
  getRefreshToken,
  getToken,
  setTokens,
} from "@/lib/auth/token"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

/** Invoked on any 401 response so the app can clear session state and
 * redirect to login. Wired up once by AuthProvider at app root. */
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

// Single-flight refresh: many requests can 401 at once (e.g. a dashboard
// firing several queries), but only one refresh call should go out. The rest
// await the same promise, then retry with the new access token.
let refreshInFlight: Promise<boolean> | null = null

async function performRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { access_token: string; refresh_token: string }
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
      // FastAPI/Pydantic 422 validation errors
      return detail
        .map((e) =>
          e && typeof e === "object" && "msg" in e ? String(e.msg) : String(e)
        )
        .join("; ")
    }
  }
  return fallback
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Send as application/x-www-form-urlencoded instead of JSON. */
  form?: Record<string, string>
  auth?: boolean
  /** Internal: set on the single retry after a successful token refresh, so a
   * second 401 doesn't loop back into another refresh attempt. */
  _retry?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, form, auth = true, _retry = false, headers, ...rest } = options

  const finalHeaders = new Headers(headers)
  let finalBody: BodyInit | undefined

  if (form) {
    finalHeaders.set("Content-Type", "application/x-www-form-urlencoded")
    finalBody = new URLSearchParams(form)
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json")
    finalBody = JSON.stringify(body)
  }

  if (auth) {
    const token = getToken()
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  })

  // An authed request that 401s may just have a stale (expired) access token.
  // Try one refresh, and if it works, replay the original request once.
  if (res.status === 401 && auth && !_retry) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return request<T>(path, { ...options, _retry: true })
    }
    // Refresh token missing or also expired — the session is truly over.
    clearTokens()
    unauthorizedHandler?.()
  }

  if (!res.ok) {
    const parsed = await parseBody(res)
    throw new ApiError(
      res.status,
      extractMessage(parsed, `Request failed with status ${res.status}`),
      parsed
    )
  }

  return (await parseBody(res)) as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
  form: <T>(path: string, form: Record<string, string>, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", form }),
}
