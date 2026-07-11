const STORAGE_KEY = "auth_token"

let token: string | null = null
let hydrated = false

function hydrate() {
  if (hydrated || typeof window === "undefined") return
  token = window.localStorage.getItem(STORAGE_KEY)
  hydrated = true
}

export function getToken(): string | null {
  hydrate()
  return token
}

export function setToken(next: string | null) {
  token = next
  hydrated = true
  if (typeof window === "undefined") return
  if (next) {
    window.localStorage.setItem(STORAGE_KEY, next)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
