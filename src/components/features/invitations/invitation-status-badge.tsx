import { Badge } from "@/components/ui/badge"
import type { InvitationStatus } from "@/types/api"

const STATUS_LABEL: Record<InvitationStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  revoked: "Revoked",
}

const STATUS_VARIANT: Record<
  InvitationStatus,
  "outline" | "default" | "secondary" | "destructive"
> = {
  pending: "outline",
  accepted: "default",
  declined: "secondary",
  revoked: "destructive",
}

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
