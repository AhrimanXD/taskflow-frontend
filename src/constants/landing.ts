import type { LucideIcon } from "lucide-react"
import { Building2, KanbanSquare, Lock, Radio, UserPlus, Users } from "lucide-react"

export interface LandingFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const FEATURES: LandingFeature[] = [
  {
    icon: Radio,
    title: "Live by default",
    description:
      "Every task update streams over a websocket the moment it happens — no refresh, no polling, no stale board.",
  },
  {
    icon: Building2,
    title: "Shared workspaces",
    description:
      "Spin up a workspace per team or project, with owner, admin, and member roles that actually mean something.",
  },
  {
    icon: KanbanSquare,
    title: "Personal + team tasks",
    description:
      "Keep a private list for your own work, or assign tasks to teammates inside a shared workspace — same app, both modes.",
  },
  {
    icon: UserPlus,
    title: "Invite by email",
    description:
      "Bring people in with a role-scoped invitation. They accept or decline — no shared passwords, no guesswork.",
  },
  {
    icon: Users,
    title: "Assignees & due dates",
    description:
      "Every task can carry an owner, an assignee, and a due date, so nothing quietly falls through the cracks.",
  },
  {
    icon: Lock,
    title: "Secure by design",
    description:
      "Token-based auth on every request, with workspace membership checked before anyone sees a task that isn't theirs.",
  },
]

export interface LandingBenefit {
  title: string
  description: string
}

export const BENEFITS: LandingBenefit[] = [
  {
    title: "No context-switching",
    description:
      "Personal tasks and team tasks live in one place, so you stop losing work between five different tools.",
  },
  {
    title: "Everyone sees the same board",
    description:
      "When a teammate moves a card, you see it move too — in real time, on your screen, without asking.",
  },
  {
    title: "Permissions that make sense",
    description:
      "Owners and admins manage the workspace; members do the work. Nobody accidentally deletes a project.",
  },
]

export interface Testimonial {
  quote: string
  name: string
  role: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We replaced three separate tools with one workspace. The fact that it updates live changed how our standups work.",
    name: "Priya N.",
    role: "Engineering Lead",
  },
  {
    quote:
      "Inviting contractors with member-only access, instead of handing over the keys, was the whole reason we switched.",
    name: "Diego R.",
    role: "Studio Founder",
  },
  {
    quote: "It's fast. That's the review. Tasks move the second someone touches them.",
    name: "Hannah W.",
    role: "Product Manager",
  },
]
