import { format, formatDistanceToNow } from "date-fns"

export function formatDate(value: string | Date): string {
  return format(new Date(value), "MMM d, yyyy")
}

export function formatDateTime(value: string | Date): string {
  return format(new Date(value), "MMM d, yyyy 'at' h:mm a")
}

export function formatRelative(value: string | Date): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

export function initials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}
