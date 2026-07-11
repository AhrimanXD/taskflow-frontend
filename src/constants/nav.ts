import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, ListChecks, Mail } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: "/tasks", label: "My Tasks", icon: ListChecks },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invitations", label: "Invitations", icon: Mail },
]
