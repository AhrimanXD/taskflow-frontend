import { differenceInCalendarDays, format, formatDistanceToNow } from "date-fns"

/** The backend emits naive timestamps in UTC (e.g. "2026-07-11T16:33:22")
 * with no timezone designator. `new Date()` would parse those as *local*
 * time, so on a UTC+N machine every fresh event reads as N hours in the past.
 * Append a "Z" to datetime strings that lack a timezone so they're read as
 * UTC. Date-only strings ("2026-07-14") are already treated as UTC by JS and
 * are left untouched. */
export function parseApiDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const needsUtc = value.includes("T") && !/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(value)
  return new Date(needsUtc ? `${value}Z` : value)
}

export function formatDate(value: string | Date): string {
  return format(parseApiDate(value), "MMM d, yyyy")
}

export function formatDateTime(value: string | Date): string {
  return format(parseApiDate(value), "MMM d, yyyy 'at' h:mm a")
}

export function formatRelative(value: string | Date): string {
  return formatDistanceToNow(parseApiDate(value), { addSuffix: true })
}

/** Human due-date phrasing at day granularity, e.g. "due today",
 * "due in 2 days", "3 days overdue". `overdue` is true once the day has
 * passed, for styling. */
export function formatDueDistance(value: string | Date): { label: string; overdue: boolean } {
  const days = differenceInCalendarDays(parseApiDate(value), new Date())
  if (days === 0) return { label: "due today", overdue: false }
  if (days === 1) return { label: "due tomorrow", overdue: false }
  if (days > 1) return { label: `due in ${days} days`, overdue: false }
  if (days === -1) return { label: "1 day overdue", overdue: true }
  return { label: `${Math.abs(days)} days overdue`, overdue: true }
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}
