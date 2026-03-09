import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils/constants"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
