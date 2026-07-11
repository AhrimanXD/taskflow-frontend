"use client"

import { useEffect, useState } from "react"

export type ViewMode = "list" | "board"

/** Persists the chosen view mode to localStorage, keyed by `key`. Starts at
 * `defaultMode` on both server and client to avoid a hydration mismatch,
 * then syncs from storage right after mount. */
export function useViewPreference(key: string, defaultMode: ViewMode = "list") {
  const [mode, setMode] = useState<ViewMode>(defaultMode)

  useEffect(() => {
    const stored = window.localStorage.getItem(key)
    if (stored === "list" || stored === "board") {
      setMode(stored)
    }
  }, [key])

  function update(next: ViewMode) {
    setMode(next)
    window.localStorage.setItem(key, next)
  }

  return [mode, update] as const
}
