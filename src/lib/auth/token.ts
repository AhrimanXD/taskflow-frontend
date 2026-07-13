const ACCESS_KEY = "auth_token"
const REFRESH_KEY = "auth_refresh_token"

let accessToken: string | null = null
let refreshToken: string | null = null
let hydrated = false

function hydrate() {
  if (hydrated || typeof window === "undefined") return
  accessToken = window.localStorage.getItem(ACCESS_KEY)
  refreshToken = window.localStorage.getItem(REFRESH_KEY)
  hydrated = true
}

function persist(key: string, value: string | null) {
  if (typeof window === "undefined") return
  if (value) {
    window.localStorage.setItem(key, value)
  } else {
    window.localStorage.removeItem(key)
  }
}

export function getToken(): string | null {
  hydrate()
  return accessToken
}

export function getRefreshToken(): string | null {
  hydrate()
  return refreshToken
}

export function setToken(next: string | null) {
  accessToken = next
  hydrated = true
  persist(ACCESS_KEY, next)
}

export function setRefreshToken(next: string | null) {
  refreshToken = next
  hydrated = true
  persist(REFRESH_KEY, next)
}

/** Store an access + refresh pair together (login and token refresh). */
export function setTokens(access: string | null, refresh: string | null) {
  setToken(access)
  setRefreshToken(refresh)
}

/** Wipe both tokens (logout, or an unrecoverable 401). */
export function clearTokens() {
  setTokens(null, null)
}
